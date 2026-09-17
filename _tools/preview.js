// Composes Mod/About/Preview.png from the SVGs ACTUALLY
// shipped, never from a hand-redone drawing. The previous version was made
// by hand, and it ended up advertising the very defect that had just been
// fixed: it showed the pre-overhaul palette, a grid of red hearts.
//
// The passion grid is SORTED BY HUE, 0 to 360 degrees. It is the only
// layout that demonstrates the icon set's rule 1 - every passion owns its
// hue, and together they cover the wheel - instead of merely asserting it.
//
// The bottom row shows the skills and work types, which obey the OPPOSITE
// rule: monochrome, shape alone. The two sets sit side by side on purpose,
// because that contrast explains the design choice better than a sentence would.
//
// Run after gen.js: it reads what gen.js has just written.
const fs = require('fs');

const base = 'C:/Users/nelim/Documents/rimworld/SkillIcons';
const SVG = `${base}/_tools/svg`;

// Order = increasing hue, measured on the PNGs by _tools/audit-teintes.ps1.
// The ranks are kept as comments so a review is possible without rerunning
// the audit.
const GRILLE = [
  'AS_YouthPassion',                   //   3  coral
  'AS_DedicatedPassion',               //  11  brick
  'AS_BlindPassion_Active',            //  19  ivory with gold iris
  'AS_IdeologicalPassion_Active',      //  25  salmon
  'AS_DuncePassion',                   //  26  taupe
  'AS_PainDrivenPassion',              //  28  electric orange
  'AS_NudistPassion_Active',           //  29  peach
  'PassionCritical',                   //  30  flame
  'AS_DrunkenPassion',                 //  33  amber
  'AS_CompetitivePassion',             //  43  gold
  'AS_NomadicPassion',                 //  44  ochre
  'AS_StonedPassion',                  //  73  olive
  'AS_ToxicPassion',                   //  85  acid green
  'PassionNatural',                    // 118  green
  'AS_TranshumanistPassion_Active',    // 173  neon teal
  'AS_SynergisticPassion',             // 177  turquoise
  'AS_LikeMindedPassion',              // 191  soft cyan
  'AS_FrozenPassion',                  // 196  glacier blue
  'AS_NightPassion',                   // 201  night blue
  'AS_RainyDayPassion',                // 207  rain blue
  'AS_ForbiddenPassion',               // 210  dark violet
  'AS_IntimatePassion_Active',         // 334  pink
  'AS_ObsessivePassion',               // 336  magenta
  'AS_SanguinePassion',                // 356  blood red
];

const ECHELLES = [
  ['AS_MoodyPassion_Apathy', 'AS_MoodyPassion_NoPassion', 'AS_MoodyPassion',
   'AS_MoodyPassion_Major', 'AS_MoodyPassion_Greater'],
  ['AS_PsychicPassion_Nullified', 'AS_PsychicPassion_Minor', 'AS_PsychicPassion',
   'AS_PsychicPassion_Major', 'AS_PsychicPassion_Critical'],
];

// Read off disk rather than hand-enumerated: a work type added to gen.js
// then shows up in the showcase without anyone having to think about it.
const lire = d => fs.readdirSync(`${SVG}/${d}`).filter(f => f.endsWith('.svg'))
                    .map(f => [d, f.slice(0, -4)]);
const OUTILS = [...lire('Skills'), ...lire('WorkTypes')];

// Every file restarts at id="m1", id="star"... : copied as-is into a single
// document, two same-named masks would clip each other's shapes and an icon
// would end up cut out by another icon's mask. Hence the per-slot prefix.
let slot = 0;
const poser = (dossier, nom, x, y, taille) => {
  const p = 'p' + (++slot) + '_';
  const s = fs.readFileSync(`${SVG}/${dossier}/${nom}.svg`, 'utf8')
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/id="([^"]+)"/g, (_, id) => `id="${p}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${p}${id})`);
  return `<g transform="translate(${x},${y}) scale(${(taille / 64).toFixed(4)})">${s}</g>`;
};

// 896 x 504, i.e. 16:9, and NOT a cropped square. The showcase used to be
// composed at 640 x 640 then centre-cropped to fit this format: the crop
// removed 44% of the height, i.e. the whole row of skill and work type
// icons, leaving only its caption - which announced icons that were no
// longer there. A generated board is not cropped, it is recomposed.
const W = 896, H = 504;

// Area left FREE of any icon, top left: that is where the repository's
// uniform overlay process engraves the mod's name and its summary line.
// The values are read off its own render, not assumed.
const RESERVE_X = 450, RESERVE_Y = 235;

const POLICE = "'Segoe UI Semibold','DejaVu Sans',sans-serif";
const F = JSON.stringify(POLICE);
const texte = (x, y, t, taille, couleur) =>
  `<text x="${x}" y="${y}" font-family=${F} font-size="${taille}" fill="${couleur}">${t}</text>`;

// The body is identical in both versions; only the title block differs.
const corps = [];

// The two five-degree scales fit to the right of the reserved zone: they
// are the only icon sets small enough in number to sit there without crowding.
const TE = 40, PAS_E = 62, XE = 470;
ECHELLES.forEach((e, r) => e.forEach((n, i) =>
  corps.push(poser('Passions', n, XE + i * PAS_E, 48 + r * 70, TE))));
corps.push(texte(XE, 196, 'one hue per family &#8212; saturation carries learning speed',
                 14, '#8C8C8C'));

// The 24 passions sorted by hue, across the full width: twelve per row,
// which puts neighbouring hues side by side.
corps.push(texte(28, 248, 'one hue per passion, spread right across the wheel',
                 14, '#8C8C8C'));
const T = 44, PAS_X = 70, X0 = 28;
GRILLE.forEach((n, i) =>
  corps.push(poser('Passions', n, X0 + (i % 12) * PAS_X, 258 + Math.floor(i / 12) * 62, T)));

// The monochrome row. Sitting it next to the coloured grid IS the point:
// two sets, two opposite rules.
corps.push(texte(28, 392, '12 skills and 23 work types &#8212; monochrome, so colour stays'
                        + ' the passion&#8217;s alone', 14, '#8C8C8C'));
const TO = 30, PAS_O = 46, PAR_RANGEE = 18;
OUTILS.forEach(([d, n], i) =>
  corps.push(poser(d, n, X0 + (i % PAR_RANGEE) * PAS_O,
                   402 + Math.floor(i / PAR_RANGEE) * 40, TO)));

const enveloppe = (cartouche) => [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
  `<rect width="${W}" height="${H}" fill="#2A2A2A"/>`,
].concat(cartouche, corps, ['</svg>']).join('');

// Two outputs. The source stays BARE: that is the one the repository's
// overlay process engraves, and a title already present there would
// duplicate it. The shipped showcase carries the title, so it is complete
// even if the engraving pass is not rerun.
const titre = [
  `<text x="34" y="62" font-family=${F} font-size="36" font-weight="700"`
    + ` letter-spacing="1" fill="#D2D2D2">SKILL ICONS</text>`,
  texte(36, 92, 'One icon set for passions, skills and work types.', 16, '#8C8C8C'),
  texte(36, 116, 'Vanilla Skills Expanded + Alpha Skills', 15, '#7A7A7A'),
];
fs.writeFileSync(`${SVG}/Preview.svg`, enveloppe(titre));
fs.writeFileSync(`${SVG}/PreviewSource.svg`, enveloppe([]));
console.log(`Preview 896x504: ${GRILLE.length} passions, ${ECHELLES.length} scales, `
  + `${OUTILS.length} tools; reserved zone ${RESERVE_X}x${RESERVE_Y}`);

// ModIcon: the old file was a winking emoji unrelated to the mod, most
// likely copied from elsewhere. Four well-separated hues in a 2x2 grid: at
// the size RimWorld displays it, it is the hue contrast that carries it,
// not the detail of the shapes.
slot = 0;
const QUAD = ['AS_SanguinePassion', 'AS_CompetitivePassion',
              'AS_FrozenPassion', 'AS_ObsessivePassion'];
// 128 x 128: the repository's standard. RimWorld only shows the icon at
// 32 px in the mod list, but 128 leaves margin for dense screens without
// adding weight.
// The size is DECLARED here, not only passed to Chrome: a window larger
// than the drawing captures the whole viewport, which had produced a
// 1254 x 1254 icon weighing 1.4 MB, twenty-three times the banner.
const icone = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"'
  + ' width="128" height="128">'];
QUAD.forEach((n, i) =>
  icone.push(poser('Passions', n, (i % 2) * 32 + 1, Math.floor(i / 2) * 32 + 1, 30)));
icone.push('</svg>');
fs.writeFileSync(`${SVG}/ModIcon.svg`, icone.join(''));
console.log('ModIcon.svg written: 4 hues in 2x2');
