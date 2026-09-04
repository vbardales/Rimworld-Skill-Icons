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

// 896 x 504, soit du 16:9, et NON un carre recadre. La vitrine avait ete
// composee en 640 x 640 puis rognee au centre pour tenir dans ce format : le
// recadrage retirait 44 % de la hauteur, donc toute la bande des competences et
// des types de travail, ne laissant que sa legende — qui annoncait des icones
// absentes. Une planche generee ne se rogne pas, elle se recompose.
const W = 896, H = 504;

// Zone laissee LIBRE de toute icone, en haut a gauche : c'est la que le
// traitement uniforme du depot grave le nom du mod et sa ligne de resume.
// Les valeurs sont relevees sur son propre rendu, pas supposees.
const RESERVE_X = 450, RESERVE_Y = 235;

const POLICE = "'Segoe UI Semibold','DejaVu Sans',sans-serif";
const F = JSON.stringify(POLICE);
const texte = (x, y, t, taille, couleur) =>
  `<text x="${x}" y="${y}" font-family=${F} font-size="${taille}" fill="${couleur}">${t}</text>`;

// Le corps est identique dans les deux versions ; seul le cartouche differe.
const corps = [];

// Les deux echelles a cinq degres tiennent a droite de la zone reservee : ce
// sont les seules icones assez peu nombreuses pour y loger sans se serrer.
const TE = 40, PAS_E = 62, XE = 470;
ECHELLES.forEach((e, r) => e.forEach((n, i) =>
  corps.push(poser('Passions', n, XE + i * PAS_E, 48 + r * 70, TE))));
corps.push(texte(XE, 196, 'one hue per family &#8212; saturation carries learning speed',
                 14, '#8C8C8C'));

// Les 24 passions triees par teinte, sur toute la largeur : douze par rangee,
// ce qui met les teintes voisines cote a cote.
corps.push(texte(28, 248, 'one hue per passion, spread right across the wheel',
                 14, '#8C8C8C'));
const T = 44, PAS_X = 70, X0 = 28;
GRILLE.forEach((n, i) =>
  corps.push(poser('Passions', n, X0 + (i % 12) * PAS_X, 258 + Math.floor(i / 12) * 62, T)));

// La bande monochrome. Son voisinage avec la grille coloree EST le propos :
// deux jeux, deux regles opposees.
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

// Deux sorties. La source reste NUE : c'est elle que le traitement du depot
// grave, et un titre deja present donnerait un doublon. La vitrine livree porte
// le titre, pour qu'elle soit complete meme si la gravure n'est pas rejouee.
const titre = [
  `<text x="34" y="62" font-family=${F} font-size="36" font-weight="700"`
    + ` letter-spacing="1" fill="#D2D2D2">SKILL ICONS</text>`,
  texte(36, 92, 'One icon set for passions, skills and work types.', 16, '#8C8C8C'),
  texte(36, 116, 'Vanilla Skills Expanded + Alpha Skills', 15, '#7A7A7A'),
];
fs.writeFileSync(`${SVG}/Preview.svg`, enveloppe(titre));
fs.writeFileSync(`${SVG}/PreviewSource.svg`, enveloppe([]));
console.log(`Preview 896x504 : ${GRILLE.length} passions, ${ECHELLES.length} echelles, `
  + `${OUTILS.length} outils ; zone reservee ${RESERVE_X}x${RESERVE_Y}`);

// ModIcon : l'ancien fichier etait un emoji clin d'oeil sans rapport avec le
// mod, vraisemblablement copie d'ailleurs. Quatre teintes bien separees en 2x2 :
// a la taille ou RimWorld l'affiche, c'est le contraste de teintes qui porte,
// pas le detail des formes.
slot = 0;
const QUAD = ['AS_SanguinePassion', 'AS_CompetitivePassion',
              'AS_FrozenPassion', 'AS_ObsessivePassion'];
// 128 x 128 : la norme du depot. RimWorld n'affiche l'icone qu'a 32 px dans la
// liste des mods, mais 128 laisse de la marge aux ecrans denses sans peser.
// La taille est DECLAREE ici et pas seulement passee a Chrome : une fenetre
// plus grande que le dessin fait capturer tout le viewport, ce qui avait donne
// une icone de 1254 x 1254 pesant 1,4 Mo, soit vingt-trois fois la banniere.
const icone = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"'
  + ' width="128" height="128">'];
QUAD.forEach((n, i) =>
  icone.push(poser('Passions', n, (i % 2) * 32 + 1, Math.floor(i / 2) * 32 + 1, 30)));
icone.push('</svg>');
fs.writeFileSync(`${SVG}/ModIcon.svg`, icone.join(''));
console.log('ModIcon.svg ecrit : 4 teintes en 2x2');
