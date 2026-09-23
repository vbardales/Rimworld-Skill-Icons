import { mkdtemp, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { changenoteFor } from './changenote.mjs';
import { relocatingExec } from './relocate-vdf.mjs';

const APP_ID = '294100';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function totalSize(dir) {
  let files = 0;
  let bytes = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await totalSize(path);
      files += sub.files;
      bytes += sub.bytes;
    } else {
      files += 1;
      bytes += (await stat(path)).size;
    }
  }
  return { files, bytes };
}

const dryRun = process.env.DRY_RUN !== 'false';
const workshopId = required('WORKSHOP_ID');
const packageId = required('EXPECTED_PACKAGE_ID');
const version = required('VERSION');
const commitDir = required('TAG_DIR');
const modPath = join(commitDir, 'Mod');
const changenote = changenoteFor(await readFile(join(commitDir, 'PUBLICATION.md'), 'utf8'), version);

if (!/^[1-9][0-9]*$/.test(workshopId)) throw new Error(`WORKSHOP_ID must be a positive number, got "${workshopId}"`);

const recorded = (await readFile(join(modPath, 'About', 'PublishedFileId.txt'), 'utf8')).trim();
if (recorded !== workshopId) {
  throw new Error(`Mod/About/PublishedFileId.txt says "${recorded}" but this run targets ${workshopId}`);
}
const about = await readFile(join(modPath, 'About', 'About.xml'), 'utf8');
if (!about.includes(`<packageId>${packageId}</packageId>`)) {
  throw new Error(`Mod/About/About.xml does not declare packageId ${packageId}`);
}
await stat(join(modPath, '1.6', 'Assemblies', 'SkillIcons.dll'));

const { stageModContent } = await import('semantic-release-steam/lib/stage-content.mjs');
const { uploadWorkshopItem } = await import('semantic-release-steam/lib/steamcmd.mjs');
const { createWorkshopVdf } = await import('semantic-release-steam/lib/vdf.mjs');
if (typeof uploadWorkshopItem !== 'function' || typeof createWorkshopVdf !== 'function') {
  throw new Error('semantic-release-steam does not export the upload functions this script relies on');
}
const stagePath = await stageModContent({ modPath });
const { files, bytes } = await totalSize(stagePath);
console.log(`staged ${files} files, ${(bytes / 1e6).toFixed(2)} MB, from ${modPath}`);
console.log(`target: Workshop item ${workshopId} (app ${APP_ID}); page title, preview image and visibility are left untouched`);
console.log(`change note (from PUBLICATION.md, section ${version}):\n${changenote}`);

if (dryRun) {
  // Everything the upload does except talking to Steam: the VDF it would write, and the move of
  // workshop.vdf out of the content folder, run against a fake steamcmd.
  const vdf = createWorkshopVdf({ appId: APP_ID, publishedFileId: workshopId, contentFolder: stagePath, changenote });
  for (const expected of [`"publishedfileid" "${workshopId}"`, `"appid" "${APP_ID}"`, '"changenote"']) {
    if (!vdf.includes(expected)) throw new Error(`the generated workshop.vdf lacks ${expected}`);
  }
  for (const untouched of ['"title"', '"previewfile"', '"visibility"', '"description"']) {
    if (vdf.includes(untouched)) throw new Error(`the generated workshop.vdf would set ${untouched}, which this workflow must leave alone`);
  }
  const probe = await mkdtemp(join(tmpdir(), 'vdf-probe-'));
  const probeVdf = join(probe, 'workshop.vdf');
  await writeFile(probeVdf, vdf);
  let seen;
  await relocatingExec(async (file, args) => { seen = args; return { stdout: '', stderr: '' }; })(
    'steamcmd', ['+login', 'user', '+workshop_build_item', probeVdf, '+quit'], {});
  const moved = seen?.find((arg) => arg.endsWith('workshop.vdf'));
  if (!moved || moved === probeVdf || (await readdir(probe)).includes('workshop.vdf')) {
    throw new Error('workshop.vdf is not moved out of the content folder before steamcmd runs');
  }
  console.log('upload path checked without contacting Steam: workshop.vdf content and its relocation are correct.');
  console.log('DRY RUN: nothing was sent to Steam.');
  process.exit(0);
}

await uploadWorkshopItem({
  steamCmdPath: required('STEAMCMD_PATH'),
  steamUsername: required('STEAM_USERNAME'),
  steamConfigPath: required('STEAM_CONFIG_VDF'),
  stagePath,
  appId: APP_ID,
  publishedFileId: workshopId,
  changenote,
  execFileAsync: relocatingExec(),
  verbose: true,
  logger: console,
});
console.log(`uploaded to Workshop item ${workshopId}. Verify the public page before recording it as published.`);
