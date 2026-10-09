#!/usr/bin/env node
// Regenerates FRENCH_REVIEW.md from the shipped Keyed and DefInjected XML, per TRANSLATIONS.md
// "Review file". Run from the mod root: node scripts/gen-french-review.js

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const modRoot = path.join(root, 'Mod', 'Languages');

function readKeyed(lang) {
  const file = path.join(modRoot, lang, 'Keyed', 'SkillIcons.xml');
  const xml = fs.readFileSync(file, 'utf8');
  const map = new Map();
  for (const m of xml.matchAll(/<SkillIcons\.([A-Za-z0-9]+)>([\s\S]*?)<\/SkillIcons\.\1>/g)) {
    map.set(`SkillIcons.${m[1]}`, m[2]);
  }
  return map;
}

function readDefInjectedMainButtons(lang) {
  const file = path.join(modRoot, lang, 'DefInjected', 'MainButtonDef', 'MainButtons.xml');
  if (!fs.existsSync(file)) return new Map();
  const xml = fs.readFileSync(file, 'utf8');
  const map = new Map();
  for (const m of xml.matchAll(/<SkillIcons_Settings\.([A-Za-z0-9]+)>([\s\S]*?)<\/SkillIcons_Settings\.\1>/g)) {
    map.set(`SkillIcons_Settings.${m[1]}`, m[2]);
  }
  return map;
}

// English source for the def's own label/description, since no English DefInjected file exists.
function readDefSource() {
  const file = path.join(root, 'Mod', '1.6', 'Defs', 'MainButtonDefs', 'MainButtons.xml');
  const xml = fs.readFileSync(file, 'utf8');
  const label = xml.match(/<defName>SkillIcons_Settings<\/defName>\s*<label>([\s\S]*?)<\/label>/)?.[1] ?? '';
  const description = xml.match(/<defName>SkillIcons_Settings<\/defName>[\s\S]*?<description>([\s\S]*?)<\/description>/)?.[1] ?? '';
  return new Map([
    ['SkillIcons_Settings.label', label],
    ['SkillIcons_Settings.description', description],
  ]);
}

const en = readKeyed('English');
const fr = readKeyed('French');
const defEn = readDefSource();
const defFr = readDefInjectedMainButtons('French');

function esc(s) {
  return (s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

const rev = require('child_process').execSync('git rev-parse HEAD', { cwd: root }).toString().trim();

let out = '# French review\n\n';
out += `This mod has no source language other than English: the "Original" column repeats the ` +
  `English text.\n\nRevision generated from: \`${rev}\`.\n\n`;

out += '## `Languages/English|French/Keyed/SkillIcons.xml`\n\n';
out += '| Key or path | Original | English | French |\n|---|---|---|---|\n';
for (const [key, value] of en) {
  const frText = fr.get(key) ?? '';
  const uncertain = '';
  out += `| \`${key}\` | ${esc(value)} | ${esc(value)} | ${esc(frText)}${uncertain} |\n`;
}

out += '\n## `Languages/French/DefInjected/MainButtonDef/MainButtons.xml`\n\n';
out += 'Source is the def\'s own `<label>`/`<description>` in `Mod/1.6/Defs/MainButtonDefs/MainButtons.xml`; ' +
  'no English DefInjected file exists.\n\n';
out += '| Key or path | Original | English | French |\n|---|---|---|---|\n';
for (const [key, value] of defEn) {
  const frText = defFr.get(key) ?? '';
  out += `| \`${key}\` | ${esc(value)} | ${esc(value)} | ${esc(frText)} |\n`;
}

fs.writeFileSync(path.join(root, 'FRENCH_REVIEW.md'), out);
console.log(`wrote FRENCH_REVIEW.md, ${en.size} Keyed + ${defEn.size} DefInjected rows, revision ${rev}`);
