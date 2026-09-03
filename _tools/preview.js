// Compose About/Preview.png à partir des SVG RÉELLEMENT livrés, jamais d'un
// dessin refait à la main. La version précédente était faite à la main, et elle
// a fini par annoncer le défaut qu'on venait de corriger : elle montrait la
// palette d'avant la refonte, c'est-à-dire une grille de cœurs rouges.
//
// La grille est TRIÉE PAR TEINTE, de 0° à 360°. C'est la seule mise en page qui
// démontre la règle nº1 du jeu d'icônes — chaque passion possède sa teinte, et
// elles couvrent la roue — au lieu de simplement l'affirmer dans le texte.
//
// À lancer après gen.js : il lit ce que gen.js vient d'écrire.
const fs = require('fs');

const base = 'C:/Users/nelim/Documents/rimworld/SkillIcons';
const src = `${base}/_tools/svg/Passions`;

// Ordre = teinte croissante, mesurée sur les PNG par _tools/audit-teintes.ps1.
// Les rangs de teinte sont en commentaire pour que la relecture soit possible
// sans relancer l'audit.
const GRILLE = [
  'AS_YouthPassion',                   //   3  corail
  'AS_DedicatedPassion',               //  11  brique
  'AS_BlindPassion_Active',            //  19  ivoire à iris doré
  'AS_IdeologicalPassion_Active',      //  25  saumon
  'AS_DuncePassion',                   //  26  taupe
  'AS_PainDrivenPassion',              //  28  orange électrique
  'AS_NudistPassion_Active',           //  29  pêche
  'PassionCritical',                   //  30  flamme
  'AS_DrunkenPassion',                 //  33  ambre
  'AS_CompetitivePassion',             //  43  or
  'AS_NomadicPassion',                 //  44  ocre
  'AS_StonedPassion',                  //  73  olive
  'AS_ToxicPassion',                   //  85  vert acide
  'PassionNatural',                    // 118  vert
  'AS_TranshumanistPassion_Active',    // 173  sarcelle néon
  'AS_SynergisticPassion',             // 177  turquoise
  'AS_LikeMindedPassion',              // 191  cyan doux
  'AS_FrozenPassion',                  // 196  bleu glacier
  'AS_NightPassion',                   // 201  bleu nuit
  'AS_RainyDayPassion',                // 207  bleu pluie
  'AS_ForbiddenPassion',               // 210  violet sombre
  'AS_IntimatePassion_Active',         // 334  rose
  'AS_ObsessivePassion',               // 336  magenta
  'AS_SanguinePassion',                // 356  rouge sang
];

const ECHELLES = [
  ['AS_MoodyPassion_Apathy', 'AS_MoodyPassion_NoPassion', 'AS_MoodyPassion',
   'AS_MoodyPassion_Major', 'AS_MoodyPassion_Greater'],
  ['AS_PsychicPassion_Nullified', 'AS_PsychicPassion_Minor', 'AS_PsychicPassion',
   'AS_PsychicPassion_Major', 'AS_PsychicPassion_Critical'],
];

// Chaque fichier repart de id="m1", id="star"... : recopiés tels quels dans un
// même document, deux masques homonymes se marchent dessus et une icône se
// retrouve découpée par le masque d'une autre. On préfixe donc par emplacement.
let slot = 0;
const poser = (nom, x, y, taille) => {
  const p = 'p' + (++slot) + '_';
  let s = fs.readFileSync(`${src}/${nom}.svg`, 'utf8')
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/id="([^"]+)"/g, (_, id) => `id="${p}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${p}${id})`);
  const e = (taille / 64).toFixed(4);
  return `<g transform="translate(${x},${y}) scale(${e})">${s}</g>`;
};

const W = 640, H = 640;
const POLICE = "'Segoe UI Semibold','DejaVu Sans',sans-serif";
const parts = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
  `<rect width="${W}" height="${H}" fill="#2A2A2A"/>`,
  `<text x="34" y="60" font-family=${JSON.stringify(POLICE)} font-size="42"`
    + ` font-weight="700" letter-spacing="1" fill="#D2D2D2">SKILL ICONS</text>`,
  `<text x="36" y="86" font-family=${JSON.stringify(POLICE)} font-size="17"`
    + ` fill="#8C8C8C">Vanilla Skills Expanded + Alpha Skills</text>`,
];

// 6 colonnes × 4 rangées de 64 px. Le pas horizontal (88) laisse 24 px d'air :
// à cette densité l'œil compare les teintes voisines, ce qui est tout l'objet.
const T = 64, PAS_X = 88, PAS_Y = 84, X0 = 48, Y0 = 110;
GRILLE.forEach((nom, i) => {
  parts.push(poser(nom, X0 + (i % 6) * PAS_X, Y0 + Math.floor(i / 6) * PAS_Y, T));
});

const yLegende = Y0 + 4 * PAS_Y + 22;
parts.push(`<text x="36" y="${yLegende}" font-family=${JSON.stringify(POLICE)}`
  + ` font-size="16" fill="#8C8C8C">one hue per family &#8212; saturation carries learning speed</text>`);

// Les deux échelles à cinq degrés : même teinte du bas en haut, seule la
// saturation monte. C'est la démonstration que la teinte ne sert QUE l'identité.
const TE = 56, PAS_E = 76;
ECHELLES.forEach((echelle, r) => {
  const y = yLegende + 18 + r * (TE + 12);
  echelle.forEach((nom, i) => parts.push(poser(nom, X0 + i * PAS_E, y, TE)));
});

parts.push('</svg>');
fs.writeFileSync(`${base}/_tools/svg/Preview.svg`, parts.join(''));
console.log(`Preview.svg ecrit : ${GRILLE.length} icones triees par teinte`
  + ` + ${ECHELLES.length} echelles de ${ECHELLES[0].length}`);

// ModIcon : l'ancien fichier etait un emoji clin d'oeil sans rapport avec le
// mod, vraisemblablement copie d'ailleurs. Quatre teintes bien separees en 2x2 :
// a la taille ou RimWorld l'affiche, c'est le contraste de teintes qui porte,
// pas le detail des formes.
slot = 0;
const QUAD = ['AS_SanguinePassion', 'AS_CompetitivePassion',
              'AS_FrozenPassion', 'AS_ObsessivePassion'];
const icone = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"'
  + ' width="64" height="64">'];
QUAD.forEach((nom, i) => {
  icone.push(poser(nom, (i % 2) * 32 + 1, Math.floor(i / 2) * 32 + 1, 30));
});
icone.push('</svg>');
fs.writeFileSync(`${base}/_tools/svg/ModIcon.svg`, icone.join(''));
console.log('ModIcon.svg ecrit : 4 teintes en 2x2');
