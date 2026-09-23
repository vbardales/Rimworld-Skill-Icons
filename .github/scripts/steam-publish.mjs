import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
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
const modPath = join(required('TAG_DIR'), 'Mod');
const changenote = (await readFile(required('CHANGENOTE_FILE'), 'utf8')).trim();

if (!/^[1-9][0-9]*$/.test(workshopId)) throw new Error(`WORKSHOP_ID must be a positive number, got "${workshopId}"`);
if (!changenote) throw new Error('the change note is empty');

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
const stagePath = await stageModContent({ modPath });
const { files, bytes } = await totalSize(stagePath);
console.log(`staged ${files} files, ${(bytes / 1e6).toFixed(2)} MB, from ${modPath}`);
console.log(`target: Workshop item ${workshopId} (app ${APP_ID}); page title, preview image and visibility are left untouched`);
console.log(`change note:\n${changenote}`);

if (dryRun) {
  console.log('DRY RUN: nothing was sent to Steam.');
  process.exit(0);
}

const { uploadWorkshopItem } = await import('semantic-release-steam/lib/steamcmd.mjs');
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
