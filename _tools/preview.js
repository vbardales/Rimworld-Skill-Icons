// Compose About/Preview.png et About/ModIcon.png à partir des SVG RÉELLEMENT
// livrés, jamais d'un dessin refait à la main. La version précédente était faite
// à la main, et elle a fini par annoncer le défaut qu'on venait de corriger :
// elle montrait la palette d'avant la refonte, une grille de cœurs rouges.
//
// La grille des passions est TRIÉE PAR TEINTE, de 0° à 360°. C'est la seule
// mise en page qui démontre la règle nº1 du jeu d'icônes — chaque passion
// possède sa teinte, et elles couvrent la roue — au lieu de l'affirmer.
//
// La bande du bas montre les compétences et les types de travail, qui obéissent
// à la règle INVERSE : monochromes, la forme seule. Les deux jeux voisinent
// exprès, parce que ce contraste explique le parti pris mieux qu'une phrase.
//
// À lancer après gen.js : il lit ce que gen.js vient d'écrire.
const fs = require('fs');

const base = 'C:/Users/nelim/Documents/rimworld/SkillIcons';
const SVG = `${base}/_tools/svg`;

// Ordre = teinte croissante, mesurée sur les PNG par _tools/audit-teintes.ps1.
// Les rangs sont en commentaire pour que la relecture soit possible sans
// relancer l'audit.
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

// Lus sur le disque et non énumérés à la main : un type de travail ajouté à
// gen.js apparaît alors dans la vitrine sans qu'on y pense.
const lire = d => fs.readdirSync(`${SVG}/${d}`).filter(f => f.endsWith('.svg'))
                    .map(f => [d, f.slice(0, -4)]);
const OUTILS = [...lire('Skills'), ...lire('WorkTypes')];

// Chaque fichier repart de id="m1", id="star"... : recopiés tels quels dans un
// même document, deux masques homonymes se marchent dessus et une icône se
// retrouve découpée par le masque d'une autre. On préfixe donc par emplacement.
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

const W = 640, H = 640;
const POLICE = "'Segoe UI Semibold','DejaVu Sans',sans-serif";
const F = JSON.stringify(POLICE);
const texte = (x, y, t, taille, couleur) =>
  `<text x="${x}" y="${y}" font-family=${F} font-size="${taille}" fill="${couleur}">${t}</text>`;

const parts = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
  `<rect width="${W}" height="${H}" fill="#2A2A2A"/>`,
  `<text x="34" y="50" font-family=${F} font-size="38" font-weight="700"`
    + ` letter-spacing="1" fill="#D2D2D2">SKILL ICONS</text>`,
  texte(36, 74, 'Vanilla Skills Expanded + Alpha Skills', 16, '#8C8C8C'),
];

// 6 colonnes × 4 rangées. Le pas laisse de l'air : à cette densité l'œil compare
// les teintes voisines, ce qui est tout l'objet de la planche.
const T = 54, PAS_X = 88, PAS_Y = 64, X0 = 48, Y0 = 92;
GRILLE.forEach((n, i) =>
  parts.push(poser('Passions', n, X0 + (i % 6) * PAS_X, Y0 + Math.floor(i / 6) * PAS_Y, T)));

const yL1 = Y0 + 4 * PAS_Y + 20;
parts.push(texte(36, yL1, 'one hue per family &#8212; saturation carries learning speed',
                 15, '#8C8C8C'));

// Les deux échelles à cinq degrés : même teinte du bas en haut, seule la
// saturation monte. La démonstration que la teinte ne sert QUE l'identité.
const TE = 38, PAS_E = 62;
ECHELLES.forEach((e, r) => e.forEach((n, i) =>
  parts.push(poser('Passions', n, X0 + i * PAS_E, yL1 + 12 + r * (TE + 8), TE))));

// La bande du bas : compétences puis types de travail, monochromes. Leur
// voisinage avec la grille colorée EST le propos — deux jeux, deux règles.
const yL2 = yL1 + 12 + 2 * (TE + 8) + 24;
parts.push(texte(36, yL2, '12 skills and 23 work types &#8212; monochrome, so colour stays'
                        + ' the passion&#8217;s alone', 15, '#8C8C8C'));
const TO = 28, PAS_O = 48, PAR_RANGEE = 12;
OUTILS.forEach(([d, n], i) =>
  parts.push(poser(d, n, X0 + (i % PAR_RANGEE) * PAS_O,
                   yL2 + 12 + Math.floor(i / PAR_RANGEE) * (TO + 8), TO)));

parts.push('</svg>');
fs.writeFileSync(`${SVG}/Preview.svg`, parts.join(''));
console.log(`Preview.svg : ${GRILLE.length} passions triees par teinte, `
  + `${ECHELLES.length} echelles, ${OUTILS.length} outils`);

// ModIcon : l'ancien fichier etait un emoji clin d'oeil sans rapport avec le
// mod, vraisemblablement copie d'ailleurs. Quatre teintes bien separees en 2x2 :
// a la taille ou RimWorld l'affiche, c'est le contraste de teintes qui porte,
// pas le detail des formes.
slot = 0;
const QUAD = ['AS_SanguinePassion', 'AS_CompetitivePassion',
              'AS_FrozenPassion', 'AS_ObsessivePassion'];
const icone = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"'
  + ' width="64" height="64">'];
QUAD.forEach((n, i) =>
  icone.push(poser('Passions', n, (i % 2) * 32 + 1, Math.floor(i / 2) * 32 + 1, 30)));
icone.push('</svg>');
fs.writeFileSync(`${SVG}/ModIcon.svg`, icone.join(''));
console.log('ModIcon.svg ecrit : 4 teintes en 2x2');
