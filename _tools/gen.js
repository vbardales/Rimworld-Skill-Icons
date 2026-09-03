// Génère les 34 icônes distinctes, en SVG, dans le langage graphique d'Oracle.
// node gen.js  ->  ../svg/*.svg   et   ./sil/*.svg (silhouettes noires, test de lisibilité)
const fs = require('fs');

// ---------------------------------------------------------------- palette
const P = {
  red:'#CC362F', grey:'#939393',
  greenP:'#387F36', orangeP:'#F79839', leaf:'#5AA83F',
  ice:'#6FBBDD', frost:'#D8F0FA', amber:'#E8A33D', purple:'#A96FC4',
  lav:'#B39DDB', pink:'#E07A9F', steel:'#8FA0B0', toxic:'#7CB342',
  gold:'#E0B54A', cream:'#D9C9A3', slate:'#5F7C8A', 
  crimson:'#A3202B', greyPurple:'#8A7F94',
  iceP:'#6FBBDD',   // même bleu, mais employé comme forme principale (frozen)
  amberP:'#E8A33D', // la coupe de drunken : l'ambre porte la forme
  silver:'#B8C4CE', // la lame de vengeful, plus claire que l'acier dormant
  flash:'#FFF6D0',  // l'eclat de douleur de pain-driven, deux frames sur vingt-quatre
  neon:'#4FE8D8',   // la trainee du signal de transhumanist
  blanc:'#F4F8FA',  // sa tete lumineuse
  trace:'#14595C',  // Piste SOMBRE : en argent clair, les points fluo ne
                    // ressortaient plus une fois la puce passee en sarcelle.
                    // Un signal lumineux exige une piste plus sombre que lui.
                    // CLE PRINCIPALE a dessein : en
                    // accessoire elles prendraient le meme gris que la moitie
                    // machine et disparaitraient dans l'onglet Travail
  ghost:'#4A4A4A',  // la passion "None" : presente, mais fantomatique

  // ------------------------------------------------------------------------
  // UNE TEINTE PAR PASSION, distribuee sur tout le cercle chromatique.
  //
  // C'est la correction la plus importante du set : 21 icones sur 40 avaient
  // une masse rouge et un petit accessoire colore. A 24 px l'accessoire
  // disparait, et il ne restait qu'une rangee de taches rouges quasi
  // identiques. La teinte doit porter l'identite, pas l'accessoire.
  tDedicated:'#B4462F',    // rouge brique
  tObsessive:'#C2185B',    // magenta
  tSynergistic:'#1FA5A0',  // turquoise
  tFrozen:'#9FDCF2',       // bleu glacier tres clair
  tNight:'#2E4A8C',        // bleu nuit
  tDrunken:'#E0A02E',      // ambre
  tYouth:'#F2726B',        // rose corail
  tVengeful:'#8E1F22',     // rouge sombre
  tForbidden:'#4A4258',    // violet tres sombre
  tNomadic:'#D9B54A',      // ocre
  tSanguine:'#B3121C',     // rouge sang
  tToxic:'#8FD130',        // vert acide
  tPain:'#FF7A1A',         // orange electrique
  tBlind:'#E8E0CC',        // ivoire
  tCompetitive:'#C9962C',  // or profond : le corps doit etre plus SOMBRE que
                           // la couronne, sinon les deux se confondent
  orClair:'#F7DE7A',       // l'or clair de la couronne
  tDunce:'#8A6B54',        // brun taupe
  tIdeological:'#F08A70',  // rose saumon, proche du symbole Ideology
  tIntimate:'#E86BA0',     // rose
  tLikeMinded:'#6FC7D6',   // cyan doux
  tRainy:'#4C86C4',        // bleu pluie
  tStoned:'#7A8B3A',       // vert olive
  tTranshuman:'#1F8A86',   // sarcelle profonde. Le cyan vif de la table
                           // rendrait invisibles les points lumineux cyan qui
                           // parcourent la puce : meme famille, mais assez
                           // sombre pour qu'ils ressortent.
  tTraumatic:'#6B7F8C',    // bleu-gris desature
  tNudist:'#F0A878',       // peche
};

// Deux gris pour la grille de l'onglet Travail, deux aciers pour les états
// dormants. Dans les deux cas : la forme principale prend la valeur claire,
// l'accessoire la valeur sombre — aplatir sur une seule valeur détruit la
// couronne, le cadenas et le flocon.
const PRIMARY = ['red','purple','lav','toxic','slate','greyPurple','pink','iceP',
                 'amberP','greenP','orangeP','trace',
                 'tDedicated','tObsessive','tSynergistic','tFrozen','tNight','tDrunken',
                 'tYouth','tVengeful','tForbidden','tNomadic','tSanguine','tToxic',
                 'tPain','tBlind','tCompetitive','tDunce','tIdeological','tIntimate',
                 'tLikeMinded','tRainy','tStoned','tTranshuman','tTraumatic','tNudist'];
const GREY   = k => PRIMARY.includes(k) ? '#939393' : '#6B6B6B';

// Deux axes indépendants, parce qu'un seul ne peut pas porter les deux
// informations sans que l'identité et la vitesse se marchent dessus :
//
//   la TEINTE dit quelle passion  — le vert toxique, le bleu de nuit, l'ambre
//   la SATURATION dit à quelle vitesse on apprend
//   l'ACIER dit que le bonus dort (état non déclenché d'une passion à gâchette)
//
// NEUTRE, et non plus l'acier bleuté #8FA0B0 : un gris bleuté appartient à la
// même famille de teinte que le bleu de frozen, de night ou de blind, et se
// lisait donc comme une couleur thématique au lieu d'un état.
const DORMANT = k => PRIMARY.includes(k) ? '#8C8C8C' : '#606060';

// interpole deux couleurs. Prend des couleurs DÉJÀ résolues par la palette, de
// sorte que la variante grise interpole entre deux gris et reste grise.
const melange = (h1, h2, t) => {
  const p = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const [a, b] = [p(h1), p(h2)];
  return '#' + a.map((v, i) =>
    Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

// désature vers la luminance : la teinte survit, l'ardeur baisse
const fade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  const m = v => Math.round(v + (l - v) * f).toString(16).padStart(2, '0');
  return '#' + m(r) + m(g) + m(b);
};

// --------- la vitesse portée par la saturation ET la luminosité, en continu
//
// Les quatre paliers d'avant avaient trois défauts mesurables : une marche
// entre 1,99 et 2 alors que l'écart réel est infime ; 1,25, 1,5 et 1,75 rendus
// à l'identique ; et surtout, les teintes claires (l'or) paraissant plus fortes
// que les sombres (le cramoisi) à vitesse égale, puisqu'on ne touchait qu'à la
// saturation.
//
// D'où la cible de luminosité COMMUNE : à vitesse égale les icônes convergent
// vers la même clarté, quelle que soit leur teinte. C'est ce qui rend la
// progression lisible dans une grille où voisinent des passions de teintes
// différentes.
const versHsl = hex => {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6
          : max === g ? ((b - r) / d + 2) / 6
                      : ((r - g) / d + 4) / 6;
  return [h, s, l];
};
const versHex = ([h, s, l]) => {
  const f = n => {
    const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
};
// Les rehauts délibérés échappent à la rampe : leur rôle est d'être vifs, pas
// de dire une vitesse.
const REHAUTS = ['flash', 'blanc', 'frost'];
// Amplitude VOLONTAIREMENT FAIBLE : la vitesse n'est qu'une suggestion. La
// hiérarchie est teinte = identité de la passion, luminosité = état actif ou
// dormant, forme = confirmation. Une rampe ample rendait les teintes lentes si
// ternes qu'on ne les identifiait plus — la vitesse mangeait l'identité.
const bande = lrf => {
  const t = Math.max(0, Math.min(1, (lrf || 0) / 3));
  return k => {
    if (REHAUTS.includes(k)) return P[k];
    const [h, s, l] = versHsl(P[k]);
    return versHex([h, s * (0.78 + 0.22 * t), l + ((0.42 + 0.12 * t) - l) * 0.25]);
  };
};

// learnRateFactor par fichier, relevé sur les defs (maximum quand plusieurs
// defs partagent la même texture, ex. blind elevated/sublime)
const LRF = {
  AS_DrunkenPassion: 2.5, AS_NightPassion: 2.5, AS_NomadicPassion: 2.25,
  AS_PainDrivenPassion: 2, AS_SanguinePassion: 2, AS_StonedPassion: 1.8,
  AS_ToxicPassion: 2, AS_VengefulPassion: 3, AS_CompetitivePassion: 2.5,
  AS_RainyDayPassion: 2, AS_BlindPassion_Active: 2,
  AS_IdeologicalPassion_Active: 1.75, AS_IntimatePassion_Active: 1.75,
  AS_NudistPassion_Active: 2, AS_TranshumanistPassion_Active: 1.5,
  AS_DedicatedPassion: 1.25, AS_ForbiddenPassion: 1.75, AS_ObsessivePassion: 1.25,
  AS_YouthPassion: 3, AS_SynergisticPassion: 1, AS_DuncePassion: 0,
  AS_LikeMindedPassion: 1, AS_TraumaticPassion: 1, AS_FrozenPassion: 0,
  AS_MoodyPassion: 1, AS_MoodyPassion_Apathy: 0.1, AS_MoodyPassion_NoPassion: 0.35,
  AS_MoodyPassion_Major: 1.5, AS_MoodyPassion_Greater: 2,
  AS_PsychicPassion: 1, AS_PsychicPassion_Minor: 0.5, AS_PsychicPassion_Nullified: 0.1,
  AS_PsychicPassion_Major: 1.5, AS_PsychicPassion_Critical: 2,
};

// ---------------------------------------------- les deux formes canoniques
const HEART = 'M32,52C32,52 10,36.5 10,23C10,16.6 14.9,12 20.6,12'
            + 'C25.6,12 29.7,15 32,19C34.3,15 38.4,12 43.4,12'
            + 'C49.1,12 54,16.6 54,23C54,36.5 32,52 32,52Z';
const FLAME = 'M32,11C40,22 47,28 47,36C47,44.5 40.5,51 32,51'
            + 'C23.5,51 17,44.5 17,36C17,28 24,22 32,11Z';

// mappe toutes les paires de coordonnées absolues (chemins M/C/Z uniquement)
function xf(d, s, dx = 0, dy = 0, cx = 32, cy = 32) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  let i = 0;
  return d.replace(/-?\d+(?:\.\d+)?/g, () => {
    const v = nums[i], isX = i % 2 === 0; i++;
    const c = isX ? cx : cy, o = isX ? dx : dy;
    return +((v - c) * s + c + o).toFixed(2);
  });
}
const heart = (s = 1, dx = 0, dy = 0) => xf(HEART, s, dx, dy);
// contour : bande de ~4 px, mesurée au pixel sur les icônes d'Oracle
const heartRing = (s = 1, dx = 0, dy = 0) => heart(s, dx, dy) + heart(s * 0.8, dx, dy);
// flamme avec sa flamme évidée, comme le "critical" d'Oracle
const flame = (s = 1, dx = 0, dy = 0) =>
  xf(FLAME, s, dx, dy) + xf(FLAME, s * 0.46, dx, dy + s * 7);

// ------------------------------------------------------------- primitives
const circ = (cx, cy, r) =>
  `M${cx - r},${cy}A${r},${r} 0 1,0 ${cx + r},${cy}A${r},${r} 0 1,0 ${cx - r},${cy}Z`;
const poly = pts => 'M' + pts.map(p => p.join(',')).join('L') + 'Z';
const lens = (cx, cy, w, h) =>
  `M${cx - w / 2},${cy}Q${cx},${cy - h / 2} ${cx + w / 2},${cy}`
  + `Q${cx},${cy + h / 2} ${cx - w / 2},${cy}Z`;
// même lentille, pointue en haut et en bas (oreilles)
const vlens = (cx, cy, w, h) =>
  `M${cx},${cy - h / 2}Q${cx + w / 2},${cy} ${cx},${cy + h / 2}`
  + `Q${cx - w / 2},${cy} ${cx},${cy - h / 2}Z`;
const drop = (cx, cy, w, h) => {
  const r = w / 2, by = cy + h / 2 - r;
  return `M${cx},${cy - h / 2}Q${cx + r},${cy - h / 6} ${cx + r},${by}`
       + `A${r},${r} 0 1,1 ${cx - r},${by}Q${cx - r},${cy - h / 6} ${cx},${cy - h / 2}Z`;
};
// Feuille d'érable : demi-profil normalisé (pointe en 0,-1 ; base du pétiole en
// 0,+1), miroité. Ses pointes latérales franches tiennent au rétrécissement, là
// où les lobes arrondis d'une feuille de vigne fusionnent en une tache.
// Le rayon des ENCOCHES est ce qui décide de tout : trop court, chaque lobe
// devient une pointe et la feuille se lit comme une étoile. Ici les encoches
// restent vers 0.6 du rayon quand les pointes vont à 0.8–1.0, ce qui laisse une
// masse centrale et donne du corps aux lobes.
const MAPLE = [
  [0.00, -1.00], [0.20, -0.62], [0.46, -0.66], [0.44, -0.34],
  [0.74, -0.34], [0.62, -0.10], [1.00, -0.02], [0.56, 0.20],
  [0.62, 0.46], [0.32, 0.42], [0.12, 0.58], [0.05, 1.00],
];
// `petiole` à false coupe le dernier point : la feuille se termine par un bord
// droit au lieu d'une pointe, et ne pique plus que vers le bas.
const maple = (cx, cy, w, h, flip = 1, petiole = true) => {
  const pts = petiole ? MAPLE : MAPLE.slice(0, -1);
  const m = ([x, y]) => [+(cx + x * w).toFixed(2), +(cy + flip * y * h).toFixed(2)];
  const droite = pts.map(m);
  const gauche = pts.slice().reverse().slice(0, -1).map(([x, y]) => m([-x, y]));
  return poly([...droite, ...gauche]);
};

const star4 = (cx, cy, R, r) => poly(Array.from({ length: 8 }, (_, k) => {
  const a = k * Math.PI / 4 - Math.PI / 2, rad = k % 2 ? r : R;
  return [+(cx + rad * Math.cos(a)).toFixed(2), +(cy + rad * Math.sin(a)).toFixed(2)];
}));

const fill = (d, col, eo) => `<path d="${d}"${eo ? ' fill-rule="evenodd"' : ''} fill="${col}"/>`;
// met un fragment SVG quelconque à l'échelle, autour du centre de la boîte
const scaleG = (s, dx, dy, body) =>
  `<g transform="translate(${dx} ${dy}) translate(32 32) scale(${s}) translate(-32 -32)">`
  + `${body}</g>`;
const rot  = (a, cx, cy, body) => `<g transform="rotate(${a} ${cx} ${cy})">${body}</g>`;
const arc  = (cx, cy, r, a0, a1, w, col) => {
  const p = a => `${(cx + r * Math.cos(a * Math.PI / 180)).toFixed(2)},`
               + `${(cy + r * Math.sin(a * Math.PI / 180)).toFixed(2)}`;
  return `<path d="M${p(a0)}A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0},1 ${p(a1)}"`
       + ` fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
};
const line = (d, col, w, cap = 'round') =>
  `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="${cap}"/>`;

let uid = 0;
const cut = (shape, col, holes, eo) => {           // `holes` est retiré de `shape`
  const id = 'm' + (++uid);
  return `<mask id="${id}"><rect width="64" height="64" fill="#fff"/>${holes}</mask>`
       + `<path d="${shape}"${eo ? ' fill-rule="evenodd"' : ''} fill="${col}" mask="url(#${id})"/>`;
};
const K = d => `<path d="${d}" fill="#000"/>`;      // trou

// ------------------------------------------------------------ les icônes
const I = {};

// -- l'absence de passion, en option. Contour seul, fin, dans un gris sombre :
//    présent sans concurrencer les autres. Exception assumée à l'échelle de
//    saturation — None apprend à 0.35 quand l'apathie est à 0.25, donc la règle
//    voudrait qu'elle soit plus claire ; mais dix lignes sur douze la portent,
//    et si elle attire l'œil les vraies passions cessent de ressortir.
I.PassionNone = c => fill(heartRing(0.76), c('ghost'), true);

// -- les deux passions vanilla. Il faut les redessiner ici parce que VSE
//    renvoie leur icône de grille vers UI/Icons/Passion*Gray, c'est-à-dire les
//    textures de RimWorld lui-même : sans ces fichiers, l'onglet Travail
//    continue d'afficher les flammes du jeu de base à côté de nos cœurs.
// `fr` : deux battements rapprochés puis une pause — mode "battement". C'est le
// geste évident pour un cœur plein, et le sommet vanilla peut battre franchement.
I.PassionMajor = (c, fr) => {
  const BAT = [1.11, 1.05, 1, 1.08, 1.03, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  return fill(xf(HEART, fr ? BAT[fr.i % BAT.length] : 1), c('red'));
};
// `fr` : le niveau de remplissage monte puis redescend — mode "montee". Six
// pixels de course : en dessous, plus rien ne se voit à la taille du jeu.
I.PassionMinor = (c, fr) => {
  const y = fr ? 35 - 6 * (1 - Math.cos(2 * Math.PI * fr.i / fr.n)) / 2 : 35;
  return fill(heartRing(), c('red'), true) + halfCut(heart(), c('red'), y);
};
// -- "apathy" : le contour gris. `fr` le fait fondre — mode "fonte". Il s'affaisse
//    sur sa pointe en s'élargissant, jusqu'à n'être plus qu'une ligne au sol,
//    puis se reforme. C'est l'image même d'un intérêt qui s'écoule.
// De la CIRE. Elle fond par le haut — le cœur se consume, la matière s'accumule
// au sol — puis se remoule depuis le haut. Un simple écrasement se lisait
// « aplati » ; ce qui fait la fonte, c'est que la matière s'en aille quelque part.
//
// Une seule ligne de coupe horizontale suffit aux deux moitiés du cycle : à la
// fonte on garde ce qui est SOUS elle, au remoulage ce qui est AU-DESSUS.
I.PassionApathy = (c, fr) => {
  const anneau = fill(heartRing(), c('grey'), true);
  if (!fr) return anneau;
  const gris = c('grey'), i = fr.i;

  // L'ANNEAU EST TOUJOURS TRACÉ, et par-dessus le sable. C'est la précaution qui
  // compte : sans lui, au sommet du cycle on aurait un cœur plein, donc "major"
  // en gris dans l'onglet Travail. Le contour creux dit l'apathie en permanence,
  // seul le niveau à l'intérieur bouge.
  //
  // Et parce que le contour ne change jamais de forme, la silhouette tient à
  // 24 px — ce qui n'était pas le cas de la fonte, qui la détruisait à mi-cycle.
  // Le RYTHME dit l'apathie autant que la forme : un sursaut qui se remplit en
  // trois frames, se vide en cinq, et quarante frames de vide — cinq sixièmes du
  // cycle. Un va-et-vient régulier racontait un balancement, pas un renoncement.
  // Aucun palier au sommet : à peine plein, il se vide déjà.
  let niveau;                       // y de la surface du sable
  // plafond à 21 et non 13 : même au sommet il reste un creux sous le contour,
  // sinon on obtiendrait un cœur plein gris, c'est-à-dire "major" dans la grille
  if (i <= 2) niveau = 53 - 32 * (i / 2);              // il se remplit d'un coup
  else if (i <= 7) niveau = 21 + 32 * ((i - 2) / 5);   // et se vide aussitôt
  else niveau = 53;                                    // puis plus rien

  const id = 'sable' + (++uid);
  const sable = niveau < 52
    ? `<mask id="${id}"><rect x="0" y="${niveau.toFixed(1)}" width="64" height="64"`
      + ` fill="#fff"/></mask><path d="${heart(0.8)}" fill="${gris}" mask="url(#${id})"/>`
    : '';
  // Les deux écoulements SE CHEVAUCHENT : ça coule déjà par le bas dès f1 alors
  // que ça coule encore par le haut jusqu'à f3. C'est plus juste — un récipient
  // qui fuit ne se remplit pas d'abord et ne se vide qu'ensuite.
  // L'épaisseur varie : le filet enfle quand le débit est fort, s'amincit quand
  // il tarit.
  const HAUT = { 0: 2.6, 1: 2.6, 2: 2.0, 3: 1.2 };
  const BAS  = { 1: 1.2, 2: 2.0, 3: 2.8, 4: 2.8, 5: 2.2, 6: 1.4 };
  const filet = (w, y, h) => w
    ? `<rect x="${(32 - w / 2).toFixed(2)}" y="${y}" width="${w}" height="${h}"`
      + ` rx="${(w / 2).toFixed(2)}" fill="${gris}"/>` : '';
  return sable + anneau + filet(HAUT[i], 0, 14) + filet(BAS[i], 50, 14);
};

// -- "natural" : un cœur vert dont une feuille est évidée. `fr` la fait tourner
//    et respirer, comme prise par une brise — mode "brise".
// La feuille s'envole du cœur, fait le tour, et rentre par l'autre côté.
//
// L'astuce : elle est dessinée DEUX fois, avec des masques inverses. Là où elle
// chevauche le cœur elle est un trou ; partout ailleurs elle est pleine. La
// bascule creux/plein se fait donc toute seule au franchissement du bord, sans
// qu'aucune frame ait à la décider.
I.PassionNatural = (c, fr) => {
  const FEUILLE = 'M22,34C25,24 33,20 43,22C40,31 33,37 22,34Z';
  const t = fr ? Math.max(0, Math.min(1, (fr.i - 4) / (fr.n - 6))) : 0;
  const dx = 24 * Math.sin(2 * Math.PI * t);
  const dy = -11 * (1 - Math.cos(2 * Math.PI * t));
  const a = 360 * t;
  const posee = col =>
    `<g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) rotate(${a.toFixed(1)} 32 28)">`
    + `<path d="${FEUILLE}" fill="${col}"/></g>`;
  const id = 'hors' + (++uid);
  return cut(heart(), c('greenP'), posee('#000'))
    + `<mask id="${id}"><rect width="64" height="64" fill="#fff"/>`
    + `<path d="${heart()}" fill="#000"/></mask>`
    + `<g mask="url(#${id})">${posee(c('greenP'))}</g>`;
};

// `fr` : la flamme intérieure rugit, puis une aura de six traits jaillit —
// mode "surchauffe". C'est le sommet de l'échelle vanilla, il a le droit.
I.PassionCritical = (c, fr) => {
  const t = fr ? fr.i / fr.n : 0;
  const s = fr ? 0.5 + 0.055 * Math.sin(2 * Math.PI * t) : 0.5;
  const l = fr && fr.i >= fr.n * 0.6
    ? 7.5 * Math.sin(Math.PI * (fr.i - fr.n * 0.6) / (fr.n * 0.4)) : 0;
  const aura = l > 0.4
    ? [0, 60, 120, 180, 240, 300].map(a => rot(a, 32, 32,
        `<rect x="55" y="30" width="${l.toFixed(2)}" height="4" rx="2"`
        + ` fill="${c('orangeP')}"/>`)).join('')
    : '';
  return aura + cut(heart(), c('orangeP'), K(xf(FLAME, s, 0, 1)));
};

// -- "critical" de VSE : la flamme passe DANS le cœur au lieu de le remplacer.
//    Comme les six autres icônes vanilla/VSE (major, minor, apathy, natural...),
//    elle est entièrement redessinée ici : le mod ne reprend aucune texture.

// -- cœur amputé d'un quart. Le contour complet reste tracé : sans lui on ne
//    voit pas ce qui manque, on voit juste une forme bancale.
// `fr` : le quart manquant se comble en partie puis se rouvre — mode "elan".
// Il ne se referme jamais tout à fait : un cœur entier, ce serait "major".
I.AS_DedicatedPassion = (c, fr) => {
  const x = fr ? 33 + 9 * (1 - Math.cos(2 * Math.PI * fr.i / fr.n)) / 2 : 33;
  return fill(heartRing(), c('tDedicated'), true)
    + cut(heart(), c('tDedicated'),
          `<rect x="${x.toFixed(2)}" y="3" width="30" height="27" rx="5" fill="#000"/>`);
};

// -- spirale évidée : la fixation
// `fr` fait tourner la spirale : mode "spirale". Elle compte un nombre entier de
// tours, donc une rotation complète boucle sans raccord.
I.AS_ObsessivePassion = (c, fr) => {
  const pts = [];
  for (let t = 0; t <= 3.2 * Math.PI; t += 0.1) {
    const r = 1.5 + 2.05 * t;
    pts.push(`${(32 + r * Math.cos(t)).toFixed(2)},${(31 + r * Math.sin(t)).toFixed(2)}`);
  }
  const a = fr ? 360 * fr.i / fr.n : 0;
  return cut(heart(), c('tObsessive'), rot(a, 32, 31, line('M' + pts.join('L'), '#000', 5)));
};

// -- un cœur qui émet vers un autre : le rayonnement devient directionnel,
//    sinon la composition se confondait avec les deux cœurs d'intimate
// `fr` fait enfler l'onde : mode "onde". Une arche, puis deux, puis trois, puis
// on repart d'une seule — le rayonnement gagne du terrain par paliers.
// Un pendule de Newton, en cœurs. Les trois du milieu ne bougent JAMAIS : c'est
// exactement ce que dit la passion — l'élan traverse la rangée sans la déranger
// et ressort de l'autre côté.
I.AS_SynergisticPassion = (c, fr) => {
  // NI portique NI fils : ce sont des traits d'un pixel, ils écrasaient tout le
  // reste à la taille du jeu. Quatre cœurs jointifs suffisent — les deux du
  // milieu ne bougent jamais, ceux des bords s'écartent tour à tour.
  const X = [13.5, 26, 38.5, 51], D = 7;
  let gauche = 0, droite = 0;
  if (fr) {
    const q = fr.n / 4, i = fr.i;
    if (i < q)          gauche = -D * Math.cos((i / q) * Math.PI / 2);
    else if (i < 2 * q) droite = D * Math.sin(((i - q) / q) * Math.PI / 2);
    else if (i < 3 * q) droite = D * Math.cos(((i - 2 * q) / q) * Math.PI / 2);
    else                gauche = -D * Math.sin(((i - 3 * q) / q) * Math.PI / 2);
  } else {
    droite = D;   // à l'arrêt, un cœur reste écarté : sinon c'est un rang de perles
  }
  return [X[0] + gauche, X[1], X[2], X[3] + droite]
    .map(x => fill(heart(0.284, x - 32, 0), c('tSynergistic'))).join('');
};

// -- flocon posé sur un cœur de glace
// `fr` fait pousser des aiguilles de givre sur le bord du cœur : mode "givre".
// Le flocon, lui, ne bouge pas — c'est l'icône de référence, le voir apparaître
// et disparaître se lirait comme un défaut d'affichage.
I.AS_FrozenPassion = (c, fr) => {
  // `fr` fait tomber la neige : mode "neige". Quatre flocons décalés qui
  // descendent en dérivant. Les aiguilles de givre que j'avais d'abord posées
  // sur le bord du cœur se lisaient mal — la neige qui tombe, si.
  const neige = fr
    ? [[13, 0, 2.4], [25, 0.3, 1.8], [51, 0.55, 2.1], [40, 0.8, 1.6]].map(([x, ph, r]) => {
        const u = ((fr.i / fr.n) + ph) % 1;
        // de -6 à 70 : le flocon entre et sort hors cadre, donc le raccord de
        // boucle est masqué par le bord au lieu d'être un saut visible
        return circ(x + 2.5 * Math.sin(4 * Math.PI * u), -6 + 76 * u, r);
      }).join('')
    : '';
  return fill(heart(0.84, -5, -4), c('tFrozen'))
    + (neige ? fill(neige, c('frost')) : '')
    + [0, 60, 120].map(a => rot(a, 43, 41,
        `<rect x="30" y="38.5" width="26" height="5" rx="2.5" fill="${c('frost')}"/>`)).join('');
};

// -- le croissant domine, le cœur se niche dedans, une étoile pour finir.
//    `fr` (numéro de frame) fait scintiller l'étoile : mode "twinkle".
I.AS_NightPassion = (c, fr) => {
  // amplitude portée de ±28 % à ±48 % : en dessous, l'étoile scintillait d'un
  // demi-pixel et personne ne pouvait le voir
  const k = fr ? 1 + 0.48 * Math.sin(2 * Math.PI * fr.i / fr.n) : 1;
  // MASQUE, et non fill-rule="evenodd". L'evenodd remplit la différence
  // SYMÉTRIQUE : la part du cercle intérieur qui déborde du cercle extérieur
  // était donc peinte elle aussi, et faisait une seconde lune à droite. Deux
  // cercles en evenodd ne donnent jamais un croissant — au mieux un anneau,
  // quand l'intérieur est entièrement contenu.
  return cut(circ(29, 33, 21), c('ice'), K(circ(39, 33, 19)))
    + fill(heart(0.34, 12, 5), c('tNight'))
    + `<g id="star" transform="translate(50 11) scale(${k}) translate(-50 -11)">`
    + fill(star4(50, 11, 8, 2.8), c('cream')) + '</g>';
};

// -- la coupe de champagne. `fr` fait monter les bulles au-dessus du buvant
//    (mode "champagne") : elles ne peuvent vivre qu'entre y=2 et y=17, sous le
//    buvant elles seraient noyées dans l'ambre du bol.
I.AS_DrunkenPassion = (c, fr) => {
  const t = fr ? fr.i / fr.n : 0;
  const bulle = (x, r0, dephasage) => {
    const u = (t + dephasage) % 1;              // 0 = vient de naître, 1 = éclate
    // le rayon tombe à zéro : la bulle éclate au lieu de disparaître d'un bond
    return `<circle cx="${x}" cy="${(17 - 15 * u).toFixed(2)}"`
         + ` r="${(r0 * (1 - u)).toFixed(2)}"/>`;
  };
  const verre = fill('M10,18H54C53,30 44,38 32,38C20,38 11,30 10,18Z', c('tDrunken'))
    + `<rect x="29.5" y="37" width="5" height="12" fill="${c('tDrunken')}"/>`
    + `<rect x="17" y="48" width="30" height="5.5" rx="2.7" fill="${c('tDrunken')}"/>`
    // le cœur est ce qu'il y a dans le verre
    + fill(heart(0.38, 0, -6), c('red'))
    + `<g id="bubbles" fill="${c('tDrunken')}">`
    + bulle(27, 3.6, 0) + bulle(37, 3.0, 0.38) + bulle(45, 2.6, 0.71) + '</g>';
  // le verre tangue sur son pied : les bulles seules ne disaient pas l'ivresse
  return fr ? rot(4.5 * Math.sin(2 * Math.PI * t), 32, 53, verre) : verre;
};

// -- cœur dans le cœur : l'ardeur qui s'éteindra en grandissant
// `fr` : le cœur intérieur grandit jusqu'à emplir le contour, puis les deux
// s'effacent d'un coup et tout recommence — mode "croissance". C'est le sens
// même de la passion : elle s'éteint en grandissant, à quinze ans.
I.AS_YouthPassion = (c, fr) => {
  if (!fr) return fill(heartRing(), c('tYouth'), true) + fill(heart(0.4), c('tYouth'));
  // Le fruit mûrit en grandissant : vert, puis orange, puis rouge.
  const mur = t => t < 0.5 ? melange(c('leaf'), c('orangeP'), t * 2)
                           : melange(c('orangeP'), c('tYouth'), (t - 0.5) * 2);
  // Aller-RETOUR : le contour ne bouge jamais, seul le cœur intérieur grandit
  // en mûrissant puis redécroît en reverdissant. Le raccord de fin de boucle est
  // alors continu par construction — la version précédente faisait disparaître
  // les deux formes, et la dernière image sautait sur la première.
  const demi = fr.n / 2;
  const t = fr.i <= demi ? fr.i / demi : (fr.n - fr.i) / demi;
  return fill(heartRing(), c('tYouth'), true)
    + fill(heart(0.35 + 0.5 * t), mur(t));
};

// -- la lame : le cœur fêlé se lisait comme un chagrin d'amour, pas comme une vengeance
I.AS_VengefulPassion = (c, fr) =>
  // `fr` : la lame se retire, frappe, puis remonte — mode "frappe". Le décalage
  // est appliqué DANS le groupe déjà incliné, donc le poignard coulisse le long
  // de son propre axe et non verticalement.
  ((fr) => {
    // Frappe INSTANTANÉE, retrait lent : la lame passe de -5 à +8 en une seule
    // frame, puis met six frames à revenir. L'inverse — avancer progressivement
    // — donnait une poussée molle, pas un coup.
    const FRAPPE = { 8: -2, 9: -5, 10: 8, 11: 7.2, 12: 6.2, 13: 5, 14: 3.8, 15: 2.6 };
    const d = fr ? (FRAPPE[fr.i] ?? 0) : 0;
    return fill(heart(0.94, 0, -1), c('tVengeful'))
      + rot(24, 32, 32, `<g transform="translate(0 ${d})">`
          + fill(poly([[32, 3], [36.5, 17], [36.5, 38], [27.5, 38], [27.5, 17]]), c('silver'))
          + `<rect x="17" y="38" width="30" height="7" rx="3" fill="${c('silver')}"/>`
          + `<rect x="28" y="45" width="8" height="14" rx="3" fill="${c('slate')}"/></g>`);
  })(fr);

// -- anse de cadenas + trou de serrure
// `fr` fait bâiller l'anse : mode "cadenas". Elle pivote sur sa branche droite,
// comme un vrai cadenas, s'ouvre six frames sur vingt-quatre puis se referme.
I.AS_ForbiddenPassion = (c, fr) => {
  // L'anse est un U dont les DEUX branches plongent jusqu'à y=27, c'est-à-dire
  // sous le bord supérieur du cœur (y≈18) qui est tracé par-dessus : elles sont
  // donc enfouies dans le corps, comme sur un vrai cadenas.
  //
  // Ouvrir, c'est pivoter sur le pied de la branche droite : la branche gauche
  // remonte et SORT du cœur. C'est cette extraction qu'on lit, pas la rotation.
  // Sans branches — une simple arche posée dessus — il n'y avait rien à sortir.
  const OUVRE = { 15: 20, 16: 42, 17: 62, 18: 70, 19: 70, 20: 62, 21: 42, 22: 18 };
  const a = fr ? (OUVRE[fr.i] ?? 0) : 0;
  const anse = `<path d="M24,27L24,16A8,8 0 0,1 40,16L40,27" fill="none"`
             + ` stroke="${c('steel')}" stroke-width="6" stroke-linecap="round"/>`;
  return rot(a, 40, 27, anse)
    + cut(heart(0.88, 0, 5), c('tForbidden'),
          K(circ(32, 33, 5.5)) + K(poly([[29, 34], [35, 34], [37.5, 46], [26.5, 46]])));
};

// -- étoile de route
// `fr` : l'étoile traverse l'icône de bas en haut, naît et s'éteint en chemin —
// mode "voyage". Le `rotate` d'origine inclinait l'ensemble de 4°, c'est-à-dire
// rien du tout ; une passion nomade doit se déplacer, pas frémir.
I.AS_NomadicPassion = (c, fr) => {
  const t = fr ? fr.i / fr.n : 0;
  const k = fr ? Math.sin(Math.PI * t) : 1;
  return fill(heart(0.74, -6, 5), c('tNomadic'))
    + (k > 0.08
        ? fill(star4(14 + 34 * t, 46 - 32 * t, 14 * k, 4.5 * k), c('cream'))
        : '');
};

// -- goutte de sang suspendue à la pointe
I.AS_SanguinePassion = (c, fr) =>
  // `fr` : une goutte grossit à la pointe pendant que la précédente tombe, en
  // opposition de phase — mode "saignee". L'icône statique est inchangée.
  ((fr) => {
    const goutte = u => u < 0.5
      ? drop(32, 52, 13 * u * 2, 18 * u * 2)              // se forme à la pointe
      : drop(32, 52 + 26 * (u - 0.5) * 2, 13, 18);        // se détache et tombe
    const g = fr
      ? goutte((fr.i / fr.n) % 1) + goutte(((fr.i / fr.n) + 0.5) % 1)
      : drop(32, 52, 13, 18);
    return fill(heart(0.88, 0, -6), c('tSanguine')) + fill(g, c('crimson'));
  })(fr);

// -- cœur rongé de l'intérieur, une morsure sur le flanc
// `fr` fait dériver les trois trous jusqu'à former deux orbites et un nez :
// mode "crane". Ils tiennent la position dix frames, se rangent, tiennent, puis
// se dispersent — la tête de mort affleure sans jamais s'installer.
I.AS_ToxicPassion = (c, fr) => {
  // 40 frames a 6 i/s : le crane est TENU dix frames au lieu de six, et le repos
  // seize. A 24 frames et 8 i/s la morphose s'enchainait trop vite et clignotait.
  const rampe = i => i < 16 ? 0 : i < 22 ? (i - 16) / 6 : i < 32 ? 1 : 1 - (i - 32) / 8;
  const u = fr ? (1 - Math.cos(Math.PI * rampe(fr.i))) / 2 : 0;
  const l = (a, b) => a + (b - a) * u;
  // Les orbites : disques au repos, ellipses INCLINÉES vers le nez à l'arrivée.
  // Un crâne n'a pas les yeux ronds — c'est l'inclinaison qui le signe.
  const oeil = (x0, y0, x1, y1, sens) => {
    const x = l(x0, x1), y = l(y0, y1);
    return rot(sens * 24 * u, x, y,
      `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}"`
      + ` rx="${l(6.5, 6).toFixed(2)}" ry="${l(6.5, 8.2).toFixed(2)}" fill="#000"/>`);
  };
  const yeux = oeil(23, 30, 23.5, 27, -1) + oeil(38, 39, 40.5, 27, 1);
  // La bouche : le troisième disque se résorbe pendant qu'un sourire s'ouvre —
  // concave vers le bas, donc les commissures REMONTENT.
  // Fine et REMONTÉE : à rayon 16 et épaisseur 5 elle descendait jusqu'à y=46 et
  // dévorait la pointe du cœur, dont le bas rongé ne se lisait plus. Ici elle
  // s'arrête à y=43 et laisse les neuf derniers pixels du cœur intacts.
  const bouche = K(circ(l(29, 32), l(46, 43), 4.5 * (1 - u)))
    + (u > 0.12 ? arc(32, 29, 14, 90 - 45 * u, 90 + 45 * u, 3, '#000') : '');
  // Le nez : un triangle pointe en haut, entre et sous les orbites.
  const nez = u > 0.3
    ? K(poly([[32, 39 - 6 * u], [32 + 4 * u, 39], [32 - 4 * u, 39]])) : '';
  return cut(heart(), c('tToxic'), yeux + bouche + nez + K(circ(58, 26, 8)))
    + fill(circ(48, 13, 4) + circ(55, 6, 2.8), c('tToxic'));
};

// -- l'éclair : les griffures partent chez traumatic, où elles disent mieux la cicatrice
// `fr` déclenche un éclat de douleur : mode "eclair". Deux frames sur
// vingt-quatre, l'éclair blanchit et enfle — une décharge, pas un clignotant.
I.AS_PainDrivenPassion = (c, fr) => {
  const eclat = fr && (fr.i === 20 || fr.i === 21);
  const bolt = fill(poly([[43, 3], [25, 31], [34, 31], [21, 59], [42, 29], [33, 29]]),
                    eclat ? c('flash') : c('gold'));
  return fill(heart(0.86, 0, 0), c('tPain')) + (eclat ? scaleG(1.14, 0, 0, bolt) : bolt);
};

// -- l'œil, cœur en guise d'iris
// `fr` fait cligner l'œil : mode "blink". L'ouverture reste pleine presque tout
// le cycle et ne se referme que sur trois frames — un clignement, pas un tic.
// Le cœur-iris est découpé à la forme de l'œil, sinon il dépasserait des
// paupières au moment où elles se ferment.
// Alpha Skills donne le MÊME iconPath aux deux paliers de cécité, si bien qu'on
// ne peut pas les distinguer à l'œil. Patches/AlphaSkills_Fixes.xml redirige le
// palier sublime vers cette variante à iris doré — c'est le palier supérieur
// (1× / 2× contre 0,5× / 1,5×), et son précepte parle de noblesse.
I.AS_BlindPassionSublime = (c, fr) => I.AS_BlindPassion(c, fr, 'tCompetitive');

I.AS_BlindPassion = (c, fr, iris) => {
  const CLIGNE = { 21: 0.55, 22: 0.10, 23: 0.55 };
  const k = fr ? (CLIGNE[fr.i] ?? 1) : 1;
  const oeil = lens(32, 32, 46, Math.max(32 * k, 3));
  const id = 'oeil' + (++uid);
  return fill(oeil, c('tBlind'))
    + `<mask id="${id}"><path d="${oeil}" fill="#fff"/></mask>`
    + `<path d="${heart(0.44)}" fill="${c(iris || 'red')}" mask="url(#${id})"/>`;
};

// -- couronne
// `fr` fait descendre la couronne sur le cœur puis remonter la coiffer : mode
// "couronnement". Elle est tracée après le cœur, donc elle passe devant lui au
// point bas et se retrouve simplement posée dessus au point haut.
I.AS_CompetitivePassion = (c, fr) => {
  const dy = fr ? 7 * (1 - Math.cos(2 * Math.PI * fr.i / fr.n)) / 2 : 0;
  return fill(heart(0.8, 0, 6), c('tCompetitive'))
    + `<g transform="translate(0 ${dy.toFixed(2)})">`
    + fill(poly([[19, 22], [19, 7], [26, 15], [32, 5], [38, 15], [45, 7], [45, 22]]), c('orClair'))
    + '</g>';
};

// -- le bonnet d'âne réellement posé sur le cœur, ses deux oreilles dressées.
//    Le bandeau déborde du cœur des deux côtés : c'est ce qui empêche de lire
//    une tête d'animal plutôt qu'un couvre-chef.
I.AS_DuncePassion = (c, fr) =>
  // La coiffe est fendue en deux pointes par une encoche profonde — et non deux
  // oreilles rapportées sur un bandeau, qui faisaient une tête d'animal. Elle
  // reste plus étroite que le cœur, et l'encoche la sépare de la couronne à
  // trois pointes de competitive.
  //
  // Les deux pointes sont découpées du corps pour que l'une puisse retomber
  // seule : `fr` la fait ployer puis la redresse — mode "oreille".
  ((fr) => {
    const CHUTE = { 12: 40, 13: 80, 14: 105, 15: 105, 16: 105, 17: 105,
                    18: 105, 19: 105, 20: 80, 21: 45, 22: 18 };
    const a = fr ? (CHUTE[fr.i] ?? 0) : 0;
    const corps = poly([[20, 23], [21, 13], [29.5, 13], [32, 18], [34.5, 13],
                        [43, 13], [44, 23]]);
    const gauche = poly([[21, 13], [24, 2], [29.5, 13]]);
    const droite = poly([[34.5, 13], [40, 2], [43, 13]]);
    return fill(heart(0.8, 0, 5), c('tDunce'))
      + fill(corps, c('grey')) + fill(gauche, c('grey'))
      + rot(a, 38.75, 13, fill(droite, c('grey')));
  })(fr);

// -- la flamme d'Ideology dressée sur le cœur
I.AS_IdeologicalPassion = (c, fr) =>
  // la flamme d'Ideology telle que le jeu la dessine — elle monte et se
  // recourbe vers l'intérieur — dressée au-dessus du cœur. C'est le cœur qui
  // lui sert de socle, et qui la distingue des flammes de moody_greater et
  // psychic_critical quand la teinte disparaît.
  // `fr` échange les deux places puis les remet : mode "permutation". Le cycle
  // tient au repos, permute, tient, revient — plutôt qu'un va-et-vient continu.
  ((fr) => {
    const rampe = i => i < 8 ? 0 : i < 14 ? (i - 8) / 6 : i < 18 ? 1 : i < 24 ? 1 - (i - 18) / 6 : 0;
    const u = fr ? (1 - Math.cos(Math.PI * rampe(fr.i))) / 2 : 0;
    const haut = -10, bas = 11;
    const yFlamme = haut + (bas - haut) * u;
    const yCoeur = bas + (haut - bas) * u;
    return scaleG(0.6, 0, yFlamme,
        fill('M31,5C39,13 45,21 46,30C47,40 40,45 31,45C22,45 16,39 17,31'
           + 'C18,24 23,19 26,15C24,21 25,26 29,26C33,26 34,21 32,16C30,11 29,9 31,5Z',
             c('gold')))
      + fill(heart(0.5, 0, yCoeur), c('tIdeological'));
  })(fr);

// -- deux cœurs franchement superposés, pas côte à côte
// `fr` les fait tourner l'un autour de l'autre : mode "ronde". L'ordre de tracé
// s'inverse à mi-course, sinon le même cœur resterait éternellement derrière et
// la ronde se lirait comme un simple balancement.
I.AS_IntimatePassion = (c, fr) => {
  const t = fr ? fr.i / fr.n : 0;
  const a = (220 + 360 * t) * Math.PI / 180, R = 7.8;
  const A = fill(heart(0.6, R * Math.cos(a), R * Math.sin(a)), c('tIntimate'));
  const B = fill(heart(0.6, -R * Math.cos(a), -R * Math.sin(a)), c('tIntimate'));
  return Math.sin(a) > 0 ? B + A : A + B;
};

// -- deux cœurs strictement identiques, reliés par un signe d'égalité.
//    `fr` en fait pousser deux autres derrière, qui grandissent puis s'effacent :
//    mode "essaimage". Ils restent petits et en retrait — la paire et son signe
//    d'égalité doivent rester ce qu'on lit en premier.
I.AS_LikeMindedPassion = (c, fr) => {
  // Les deux cœurs battent d'abord en OPPOSITION puis se synchronisent, avant de
  // se décaler à nouveau. C'est le sens même de la passion : deux esprits qui
  // s'accordent. L'essaimage d'avant — des cœurs qui bourgeonnaient derrière —
  // ne disait rien de la synchronie.
  const t = fr ? fr.i / fr.n : 0;
  const decalage = 0.25 * (1 + Math.cos(2 * Math.PI * t));   // 0,5 → 0 → 0,5
  const battement = ph => 1 + 0.13 * Math.sin(2 * Math.PI * (3 * t + ph));
  const g = fr ? battement(0) : 1, d = fr ? battement(decalage) : 1;
  return fill(heart(0.4 * g, -16, 0), c('tLikeMinded'))
    + fill(heart(0.4 * d, 16, 0), c('tLikeMinded'))
    + `<rect x="26" y="26" width="12" height="4.5" rx="2.2" fill="${c('steel')}"/>`
    + `<rect x="26" y="34" width="12" height="4.5" rx="2.2" fill="${c('steel')}"/>`;
};

// ---- échelle "moody" : la ligne ondulée signe l'humeur changeante
const wave = col => line('M13,54Q18.5,47 24,54T35,54T46,54T57,54', col, 5);
const halfCut = (d, col, y) =>
  cut(d, col, `<rect x="0" y="0" width="64" height="${y}" fill="#000"/>`);
// Les cinq crans, du plus plat au plus ardent. L'apathie garde sa courbe à
// plat : c'est son signe propre, et le seul cran qui ne soit pas violet.
const CRAN_MOODY = [
  c => fill(heartRing(0.8, 0, -5), c('greyPurple'), true)
     + line('M14,54H56', c('greyPurple'), 5),
  c => fill(heartRing(0.8, 0, -5), c('purple'), true) + wave(c('purple')),
  c => fill(heartRing(0.8, 0, -5), c('purple'), true)
     + halfCut(heart(0.8, 0, -5), c('purple'), 28) + wave(c('purple')),
  c => fill(heart(0.8, 0, -5), c('purple')) + wave(c('purple')),
  // même principe qu'au sommet de l'échelle psychique : la flamme est évidée
  // dans le cœur, elle ne le remplace pas
  c => cut(heart(0.8, 0, -5), c('purple'), K(xf(FLAME, 0.4, 0, -4.2)))
     + wave(c('purple')),
];
// `fr` fait vagabonder l'humeur autour du cran du moment puis l'y ramène : mode
// "humeur". C'est la seule passion dont le sens même est de fluctuer, donc la
// seule où faire varier l'icône elle-même dit quelque chose de juste.
// 32 frames à 6 i/s, soit un cycle de plus de cinq secondes, et chaque cran
// TENU cinq à dix frames. À 16 frames et 8 i/s, le niveau changeait toutes les
// deux frames : quatre sauts par seconde, et comme chaque saut change de forme
// entière, ça clignotait au lieu de fluctuer.
const VAGABOND = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2,
  1, 1, 1, 1,
  -1, -1, -1, -1, -1,
  0, 0,
];
const moodyIcon = s => (c, fr) =>
  CRAN_MOODY[Math.max(0, Math.min(4, s + (fr ? VAGABOND[fr.i % VAGABOND.length] : 0)))](c);
I.AS_MoodyPassion_Apathy    = moodyIcon(0);
I.AS_MoodyPassion_NoPassion = moodyIcon(1);
I.AS_MoodyPassion           = moodyIcon(2);
I.AS_MoodyPassion_Major     = moodyIcon(3);
I.AS_MoodyPassion_Greater   = moodyIcon(4);

// ---- échelle "psychic" : l'anneau, et il se dédouble aux hauts degrés
const halo  = (col, r = 22, w = 4.5) => arc(32, 32, r, 0, 359.9, w, col);
const ticks = (col, a = 0) =>
  [45, 135, 225, 315].map(b => arc(32, 32, 29, b + a - 6, b + a + 6, 4.5, col)).join('');
// `fr` : l'anneau s'élargit en s'amincissant, puis repart du centre — mode
// "onde psychique". L'ancien `pulse` faisait 2,5 % d'échelle, soit un demi-pixel
// à la taille du jeu : il y avait une séquence, mais rien à voir.
// DEUX ondes en opposition de phase, et une épaisseur qui tombe à zéro au bord.
// Avec une seule onde et une rampe linéaire, le cycle repartait d'un coup : ça
// ne bouclait pas. Ici l'une naît quand l'autre s'éteint.
const onde = (c, fr, col) => {
  if (!fr) return halo(c(col));
  const vague = ph => {
    const u = ((fr.i / fr.n) + ph) % 1;
    const w = 5.5 * (1 - u);
    return w > 0.6 ? halo(c(col), 13 + 17 * u, w) : '';
  };
  return vague(0) + vague(0.5);
};
I.AS_PsychicPassion_Nullified = (c, fr) => fill(heartRing(0.66), c('grey'), true)
                                         + onde(c, fr, 'grey');
I.AS_PsychicPassion_Minor     = (c, fr) => fill(heartRing(0.66), c('lav'), true)
                                         + halfCut(heart(0.66), c('lav'), 33) + onde(c, fr, 'lav');
I.AS_PsychicPassion           = (c, fr) => fill(heart(0.66), c('lav')) + onde(c, fr, 'lav');
I.AS_PsychicPassion_Major     = (c, fr) => fill(heart(0.66), c('lav')) + onde(c, fr, 'lav')
                                         + ticks(c('lav'), fr ? 90 * fr.i / fr.n : 0);
// Le sommet de l'échelle garde son cœur : la flamme y est ÉVIDÉE, comme dans le
// "critical" vanilla redessiné. Une flamme nue faisait perdre le cœur.
I.AS_PsychicPassion_Critical  = (c, fr) => cut(heart(0.66), c('lav'), K(xf(FLAME, 0.33, 0, 0.66)))
                                         + onde(c, fr, 'lav')
                                         + ticks(c('lav'), fr ? 90 * fr.i / fr.n : 0);

// -- trois gouttes en pied : la silhouette change, pas seulement la teinte
// `fr` fait tomber les gouttes en boucle décalée : mode "pluie". Sans `fr`,
// l'icône statique reste exactement celle qui a été validée.
I.AS_RainyDayPassion = (c, fr) => {
  // Les gouttes traversent TOUTE la hauteur, de -8 à 72 : tracées après le
  // cœur, elles lui passent donc devant. Avant, elles tombaient de 43 à 63,
  // c'est-à-dire entièrement sous lui — elles ne le croisaient jamais.
  // Le raccord de boucle est masqué par les bords, comme pour la neige.
  // Les phases sont DÉCORRÉLÉES des abscisses : avec 0 / 0,34 / 0,67 pour des x
  // croissants, les gouttes tombaient dans l'ordre et ça balayait de gauche à
  // droite au lieu de pleuvoir. Ici l'ordre de chute est 15, 41, 28, 50.
  // La troisième traverse DEUX fois par cycle : une vitesse différente casse la
  // régularité, et un nombre entier de traversées garde la boucle propre.
  const PLUIE = [[15, 0.00, 1, 1.00], [28, 0.58, 1, 0.82],
                 [41, 0.21, 2, 0.94], [50, 0.79, 1, 0.70]];
  const gouttes = fr
    ? PLUIE.map(([x, ph, vitesse, taille]) => {
        const u = ((fr.i / fr.n) * vitesse + ph) % 1;
        return drop(x, -8 + 80 * u, 9.5 * taille, 13.5 * taille);
      }).join('')
    : drop(19, 50, 9, 13) + drop(32, 54, 10.5, 15) + drop(45, 50, 9, 13);
  return fill(heart(0.8, 0, -6), c('tRainy')) + fill(gouttes, c('ice'));
};

// -- le vertige : un cœur net, deux fantômes décalés. La volute de fumée était
//    le maillon faible du set ; la vision double dit mieux l'état.
//    `fr` fait respirer l'écart entre les fantômes : mode "vertige".
//    `fr` : les trois cœurs tournent sur une ellipse aplatie et, surtout,
//    l'ordre de tracé suit la profondeur — celui de devant passe derrière et
//    inversement. C'est l'échange qui fait le vertige, pas le déplacement.
I.AS_StonedPassion = (c, fr) => {
  if (!fr) return fill(heartRing(0.66, -9, -5), c('tStoned'), true)
              + fill(heartRing(0.66, 9, 5), c('tStoned'), true)
              + fill(heart(0.66), c('tStoned'));
  const t = fr.i / fr.n;
  return [0, 1, 2]
    .map(k => {
      const a = 2 * Math.PI * (t + k / 3);
      const dx = 9.5 * Math.cos(a), dy = 5.5 * Math.sin(a);
      return { z: Math.sin(a),
               d: k === 1 ? fill(heart(0.66, dx, dy), c('tStoned'))
                          : fill(heartRing(0.66, dx, dy), c('tStoned'), true) };
    })
    .sort((p, q) => p.z - q.z)          // le plus en avant est tracé en dernier
    .map(p => p.d).join('');
};

// -- la feuille, à l'endroit exact où on l'attend
I.AS_NudistPassion = (c, fr) => {
  // v : 0 la feuille est en place, 1 elle est hors cadre et le cœur est nu
  const envol = i => i < 10 ? 0 : i < 15 ? (i - 9) / 5 : i < 19 ? 1 : 1 - (i - 18) / 5;
  const v = fr ? envol(fr.i) : 0;
  return (
  // Deux petites jambes nues sous le cœur, chacune finie par un pied : c'est
  // ce qui dit qu'il est nu. Elles sont tracées AVANT le cœur, qui en cache la
  // naissance — elles n'émergent que sous la pointe.
  //
  // `fr` fait s'envoler la feuille, et le cœur rougit aux joues pendant qu'il
  // est découvert : mode "envol". La feuille sort du cadre par le haut plutôt
  // que de s'effacer — un aplat qui s'estompe n'est pas dans le langage du set.
  [-1, 1].map(s =>
    `<rect x="${32 + s * 6 - 2.6}" y="36" width="5.2" height="16" rx="2.2" fill="${c('tNudist')}"/>`
    + `<rect x="${s > 0 ? 34.4 : 21.4}" y="49.5" width="8.2" height="5.6" rx="2.6" fill="${c('tNudist')}"/>`
  ).join('')
  + fill(heart(0.9, 0, -6), c('tNudist'))
  // La feuille est posée SUR le cœur, petite et centrée : le cœur reste entier
  // et la feuille se lit comme ce qu'elle couvre.
  + (v > 0.02
      ? fill(circ(23, 24, 4.6 * v) + circ(41, 24, 4.6 * v), c('pink'))
      : '')
  + (v < 0.98
      ? rot(46 * v, 32, 38, `<g transform="translate(${(11 * v).toFixed(2)} ${(-62 * v).toFixed(2)})">`
          + fill(maple(32, 38, 11.5, 10, -1, false), c('leaf')) + '</g>')
      : ''));
};

// -- moitié chair, moitié machine
// `fr` allume les puces l'une après l'autre : mode "puces". Le néon ne touche
// qu'une puce à la fois — les trois allumées d'un coup feraient un clignotant.
// Moitié chair, moitié PUCE. Les dents d'engrenage d'avant ne disaient rien :
// une puce, ce sont des pistes, des nœuds et des broches. Les broches débordent
// du cœur à droite, ce qui donne à l'icône une silhouette qui lui appartient.
// `fr` allume les nœuds l'un après l'autre le long des pistes — mode "puces".
I.AS_TranshumanistPassion = (c, fr) => {
  // DEUX pistes qui traversent le cœur ENTIER, moitié chair comprise — le
  // circuit n'est plus cantonné au métal. Segments orthogonaux et à 45°, comme
  // sur un vrai circuit imprimé : c'est cette géométrie qui le signe.
  // Tracés dans les largeurs réelles du cœur à chaque hauteur, sinon ils en
  // dépassent (il ne fait plus que 18 px de large à y = 42).
  const PISTES = [
    [[13, 28], [21, 28], [27, 34], [37, 34], [43, 28], [51, 28]],
    [[23, 43], [23, 38], [29, 32], [37, 32], [43, 38], [43, 43]],
  ];
  const mesure = P2 => {
    const seg = P2.slice(1).map(([x, y], k) => Math.hypot(x - P2[k][0], y - P2[k][1]));
    return [seg, seg.reduce((a, b) => a + b, 0)];
  };
  // point situé à la fraction s du parcours
  const pointSur = (P2, s) => {
    const [seg, total] = mesure(P2);
    let d = ((s % 1) + 1) % 1 * total;
    for (let k = 0; k < seg.length; k++) {
      if (d <= seg[k]) {
        const f = seg[k] === 0 ? 0 : d / seg[k];
        return [P2[k][0] + (P2[k + 1][0] - P2[k][0]) * f,
                P2[k][1] + (P2[k + 1][1] - P2[k][1]) * f];
      }
      d -= seg[k];
    }
    return P2[P2.length - 1];
  };
  const t = fr ? fr.i / fr.n : 0;
  // Quatre points en tout, déphasés sur les deux pistes : ils se croisent au
  // lieu de défiler en file, ce qui fait un circuit vivant plutôt qu'un convoi.
  const POINTS = [[0, 0], [0, 0.5], [1, 0.25], [1, 0.7]];
  const signal = POINTS.map(([p, ph]) => {
    const [x, y] = pointSur(PISTES[p], t + ph);
    return fill(circ(x, y, 2.8), c('neon')) + fill(circ(x, y, 1.4), c('blanc'));
  }).join('');
  return cut(heart(), c('red'), `<rect x="32" y="0" width="32" height="64" fill="#000"/>`)
    + cut(heart(), c('tTranshuman'), `<rect x="0" y="0" width="32" height="64" fill="#000"/>`)
    // les broches, sur le flanc droit
    + [[50, 19], [52, 28], [47, 38]].map(([x, y]) =>
        `<rect x="${x}" y="${y}" width="9" height="4" rx="2" fill="${c('tTranshuman')}"/>`).join('')
    // les deux pistes, et leurs pastilles aux coudes
    + PISTES.map(P2 =>
        line('M' + P2.map(p => p.join(',')).join('L'), c('trace'), 2.2, 'round')
        + P2.map(([x, y]) => fill(circ(x, y, 2.2), c('trace'))).join('')).join('')
    + signal;
};

// -- les cicatrices : le pansement se confondait avec l'éclair en silhouette
I.AS_TraumaticPassion = c =>
  cut(heart(), c('tTraumatic'), rot(-38, 32, 32,
    [0, 1, 2].map(k => `<rect x="${11 + k * 14}" y="-10" width="5.5" height="84" fill="#000"/>`).join('')));

// ------------------------------------------------------------------ sortie
//
// Les 34 dessins deviennent les 74 fichiers qu'Alpha Skills réclame. Trois
// palettes seulement, appliquées selon la vitesse d'apprentissage du def :
//   ACTIVE  = couleurs propres        (learnRateFactor > 1, bonus vif)
//   DORMANT = deux aciers             (learnRateFactor <= 1, bonus en sommeil)
//   GREY    = deux gris               (variantes de l'onglet Travail)

const base = 'C:/Users/nelim/Documents/rimworld/SkillIcons';
const dirs = { svg: `${base}/_tools/svg/Passions`, sil: `${base}/_tools/sil` };
Object.values(dirs).forEach(d => fs.mkdirSync(d, { recursive: true }));

const ACTIVE = k => P[k];

// familles à déclenchement : le fichier nu porte la couleur vive, la variante dort
const VIF = {
  AS_DrunkenPassion: '_Inactive', AS_NightPassion: '_Inactive',
  AS_NomadicPassion: '_Inactive', AS_PainDrivenPassion: '_Inactive',
  AS_SanguinePassion: '_Inactive', AS_StonedPassion: '_Inactive',
  AS_ToxicPassion: '_Inactive', AS_VengefulPassion: '_Inactive',
  AS_CompetitivePassion: '_Off', AS_RainyDayPassion: '_Off',
};
// familles inverses : le fichier nu dort, c'est _Active qui s'allume
const DORT = ['AS_BlindPassion', 'AS_IdeologicalPassion', 'AS_IntimatePassion',
              'AS_NudistPassion', 'AS_TranshumanistPassion'];
// passions sans état déclenché, dont le bonus est permanent (lrf > 1)
const FIXE_VIF = ['AS_DedicatedPassion', 'AS_ForbiddenPassion', 'AS_ObsessivePassion',
                  'AS_YouthPassion',
                  // exception assumée : lrf = 1, mais learnRateFactorOther = 1.1,
                  // le bonus est bien réel, il porte juste sur les autres compétences
                  'AS_SynergisticPassion'];
// passions sans état déclenché et sans gain de vitesse (lrf <= 1) : palette froide
const FIXE_TERNE = ['AS_DuncePassion', 'AS_LikeMindedPassion', 'AS_TraumaticPassion'];

const head = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">';
const out = [];
const emit = (name, dessin, resolver) => {
  uid = 0;
  fs.writeFileSync(`${dirs.svg}/${name}.svg`, head + I[dessin](resolver) + '</svg>');
  out.push(name);
  uid = 0;
  fs.writeFileSync(`${dirs.sil}/${name}.svg`, head + I[dessin](() => '#000') + '</svg>');
};

const teinte = n => bande(LRF[n]);

for (const [n, suffixe] of Object.entries(VIF)) {
  emit(n, n, teinte(n)); emit(n + suffixe, n, DORMANT); emit(n + 'Grey', n, GREY);
}
for (const n of DORT) {
  emit(n, n, DORMANT); emit(n + '_Active', n, teinte(n + '_Active'));
  emit(n + 'Grey', n, GREY);
}
// passions sans état déclenché : pas d'acier, c'est la saturation seule qui parle
for (const n of [...FIXE_VIF, ...FIXE_TERNE, 'AS_FrozenPassion']) {
  emit(n, n, teinte(n));
  emit(n + 'Grey', n, GREY);
}

// Les deux échelles à cinq degrés deviennent la meilleure démonstration de la
// règle plutôt qu'une exception : teinte de famille constante, saturation qui
// monte avec la vitesse — de l'apathie à 0.1 jusqu'à la flamme à 2.
for (const f of ['Moody', 'Psychic']) {
  Object.keys(I).filter(k => k.startsWith(`AS_${f}Passion`))
    .forEach(k => emit(k, k, teinte(k)));
  emit(`AS_${f}PassionGrey`, `AS_${f}Passion`, GREY);
}

// les icônes VSE que ce mod redessine
emit('PassionCritical', 'PassionCritical', ACTIVE);
emit('PassionCriticalGrey', 'PassionCritical', GREY);
emit('PassionMajor', 'PassionMajor', ACTIVE);
emit('PassionMinor', 'PassionMinor', ACTIVE);
emit('PassionNatural', 'PassionNatural', ACTIVE);
emit('PassionNaturalGrey', 'PassionNatural', GREY);
emit('PassionApathy', 'PassionApathy', ACTIVE);
// le palier sublime de la cecite, redirige par patch vers sa propre texture
emit('AS_BlindPassionSublime', 'AS_BlindPassionSublime', DORMANT);
emit('AS_BlindPassionSublime_Active', 'AS_BlindPassionSublime', teinte('AS_BlindPassion_Active'));

// Et les mêmes sous les chemins de RimWorld : c'est là que VSE va chercher
// l'icône de grille de "interested" et "burning". Sans ça, l'onglet Travail
// mélange nos cœurs et les flammes du jeu de base.
const dirUI = `${base}/_tools/svg/UI`;
fs.mkdirSync(dirUI, { recursive: true });
for (const [nom, dessin, res] of [
  ['PassionMajor', 'PassionMajor', ACTIVE], ['PassionMajorGray', 'PassionMajor', GREY],
  ['PassionMinor', 'PassionMinor', ACTIVE], ['PassionMinorGray', 'PassionMinor', GREY],
]) {
  uid = 0;
  fs.writeFileSync(`${dirUI}/${nom}.svg`, head + I[dessin](res) + '</svg>');
}
// et l'absence de passion, que la DLL ne sert que si l'option est cochée
emit('PassionNone', 'PassionNone', ACTIVE);

console.log(`${out.length} fichiers SVG écrits (à partir de ${Object.keys(I).length} dessins)`);

// ------------------------------------------------------- frames d'animation
//
// Les compteurs et les modes reproduisent EXACTEMENT la table Specs de
// SkillIcons.dll (PassionIconAnimations.cs) : la DLL charge
// Passions/Animated/<clé>_<NN> et s'arrête au nombre qu'elle a en dur. Un
// compteur qui diverge fait retomber la passion sur son icône statique.
// Compteurs doublés par rapport à la première version, et cadences doublées
// avec eux : la durée de boucle est inchangée, le mouvement est deux fois plus
// fin. Toute modification ici doit être reportée dans Specs, côté C#.
const SPECS = [
  // l'humeur parcourt l'échelle et revient à son cran
  ['AS_MoodyPassion', 32, 'humeur'], ['AS_MoodyPassion_Apathy', 32, 'humeur'],
  ['AS_MoodyPassion_NoPassion', 32, 'humeur'], ['AS_MoodyPassion_Major', 32, 'humeur'],
  ['AS_MoodyPassion_Greater', 32, 'humeur'],
  // gestes propres à chaque passion
  ['AS_BlindPassion_Active', 24, 'blink'],
  ['AS_BlindPassionSublime_Active', 24, 'blink'],          // l'œil cligne
  ['AS_CompetitivePassion', 16, 'couronnement'],    // la couronne coiffe
  ['AS_ForbiddenPassion', 24, 'cadenas'],           // l'anse bâille
  ['AS_FrozenPassion', 24, 'givre'],                // le givre pousse
  ['AS_IdeologicalPassion_Active', 24, 'permutation'],
  ['AS_IntimatePassion_Active', 24, 'ronde'],       // les deux cœurs se poursuivent
  ['AS_LikeMindedPassion', 24, 'essaimage'],
  ['AS_NudistPassion_Active', 24, 'envol'],         // la feuille s'envole, il rougit
  ['AS_ObsessivePassion', 24, 'spirale'],
  ['AS_PainDrivenPassion', 24, 'eclair'],           // éclat de douleur
  ['AS_RainyDayPassion', 24, 'pluie'],
  ['AS_SanguinePassion', 24, 'saignee'],
  ['AS_StonedPassion', 12, 'vertige'],              // l'avant et l'arrière s'échangent
  ['AS_SynergisticPassion', 24, 'pendule'],            // ) puis )) puis )))
  ['AS_ToxicPassion', 40, 'crane'],
  ['AS_TranshumanistPassion_Active', 16, 'signal'],
  ['AS_TraumaticPassion', 16, 'tremble'],
  ['AS_VengefulPassion', 16, 'frappe'],
  ['AS_YouthPassion', 24, 'croissance'],
  ['PassionCritical', 16, 'surchauffe'],
  ['AS_DedicatedPassion', 16, 'elan'],
  ['AS_DuncePassion', 24, 'oreille'],
  // Les quatre qui avaient une séquence mais bougeaient d'un demi-pixel : elles
  // ont maintenant un geste à elles, comme les autres.
  ['AS_NightPassion', 16, 'twinkle'],      // l'étoile scintille pour de bon
  ['AS_NomadicPassion', 16, 'voyage'],     // l'étoile traverse
  ['AS_DrunkenPassion', 16, 'champagne'],  // le verre tangue en plus des bulles
  ['AS_PsychicPassion', 20, 'onde'], ['AS_PsychicPassion_Minor', 20, 'onde'],
  ['AS_PsychicPassion_Nullified', 20, 'onde'],
  ['AS_PsychicPassion_Major', 20, 'onde'], ['AS_PsychicPassion_Critical', 20, 'onde'],
  // et les trois passions vanilla qui n'avaient rien
  ['PassionMajor', 16, 'battement'], ['PassionMinor', 16, 'montee'],
  ['PassionNatural', 24, 'envolFeuille'], ['PassionApathy', 48, 'fonte'],
];

// Les clés portant un suffixe d'état désignent le dessin nu ; les autres non.
const dessinDe = k => k.replace(/_(Active)$/, '');

const transform = (mode, i, n) => {
  const p = 2 * Math.PI * i / n, s = Math.sin(p);
  switch (mode) {
    case 'pulse':  return `translate(32 32) scale(${(0.975 + 0.025 * s).toFixed(4)}) translate(-32 -32)`;
    case 'rain':   return `translate(0 ${(0.8 * s).toFixed(3)})`;
    case 'lift':   return `translate(0 ${(-1.2 * Math.max(0, s)).toFixed(3)})`;
    case 'sway':   return `rotate(${(2.0 * s).toFixed(3)} 32 51)`;
    case 'jolt':   return `rotate(${(1.5 * s).toFixed(3)} 32 32)`;
    case 'rotate': return `rotate(${(4.0 * s).toFixed(3)} 32 32)`;
    case 'float':  return `translate(0 ${(-0.8 * s).toFixed(3)})`;
    // la peur de traumatic : trois secousses par cycle, assez amples pour
    // survivre a 24 px la ou un deplacement d'un pixel ne se voit pas
    // La peur par SALVES : immobile, puis une secousse franche sur les six
    // dernières frames. En continu et à ±2,8 px — soit 1 px à la taille du jeu
    // — le tremblement était invisible ; en salve et à ±5 px, il se voit.
    case 'tremble': {
      if (i < n - 6) return '';
      const v = Math.sin(3 * Math.PI * (i - (n - 6)) / 6);
      return `translate(${(5 * v).toFixed(2)} 0) rotate(${(3.5 * v).toFixed(2)} 32 46)`;
    }
    default:       return '';   // twinkle et champagne animent leur contenu
  }
};

const frameDir = `${base}/_tools/svg/Frames`;
fs.mkdirSync(frameDir, { recursive: true });
let nb = 0;
for (const [cle, n, mode] of SPECS) {
  const dessin = dessinDe(cle);
  if (!I[dessin]) throw new Error(`dessin introuvable pour la clé ${cle}`);
  for (let i = 0; i < n; i++) {
    uid = 0;
    // PassionCritical et PassionNone ne sont pas dans l'échelle d'Alpha Skills :
    // pas de learnRateFactor à leur appliquer, ils gardent leur couleur pleine.
    const teinteFrame = LRF[cle] !== undefined ? bande(LRF[cle]) : ACTIVE;
    const corps = I[dessin](teinteFrame, { i, n });
    const t = transform(mode, i, n);
    const svg = head + (t ? `<g transform="${t}">${corps}</g>` : corps) + '</svg>';
    fs.writeFileSync(`${frameDir}/${cle}_${String(i).padStart(2, '0')}.svg`, svg);
    nb++;
  }
}
console.log(`${nb} frames d'animation écrites (${SPECS.length} séquences)`);

// =========================================================== COMPÉTENCES
// Les douze SkillDef de vanilla. Jeu SÉPARÉ des passions, et volontairement
// MONOCHROME : dans ce mod la couleur signifie déjà « quelle passion », et la
// faire signifier en plus « quelle compétence » rendrait les deux illisibles.
// Ici c'est la forme seule qui porte l'identité — ce qui revient à appliquer la
// règle nº2 du jeu d'icônes (lisible en silhouette) comme règle unique.
//
// Deux tons seulement : une masse claire, une ombre pour le détail interne. À
// 20 px le second ton ne se lit plus comme une couleur mais comme un creux,
// c'est ce qui empêche l'icône de s'aplatir en tache.
const OUTIL = { clair: '#D6D6D6', ombre: '#8F8F8F' };
const mono = k => OUTIL[k];

// roue dentée : n dents carrées entre le rayon interne r et externe R
const roue = (cx, cy, R, r, n) => poly(Array.from({ length: n * 4 }, (_, k) => {
  const pas = 2 * Math.PI / (n * 4);
  const a = k * pas - Math.PI / 2;
  const rad = (k % 4 === 0 || k % 4 === 3) ? R : r;
  return [+(cx + rad * Math.cos(a)).toFixed(2), +(cy + rad * Math.sin(a)).toFixed(2)];
}));

// bulle de dialogue avec sa queue
const bulle = (cx, cy, w, h, sens = 1) =>
  `M${cx - w / 2},${cy - h / 2}h${w}a4,4 0 0,1 4,4v${h - 8}a4,4 0 0,1 -4,4`
  + `h${-(w / 2 - 4 * sens)}l${-5 * sens},6l${sens > 0 ? 0.5 : -0.5},-6`
  + `h${-(w / 2 + 4 * sens - 4)}a4,4 0 0,1 -4,-4v${-(h - 8)}a4,4 0 0,1 4,-4Z`;

// -- tir : un réticule, pas un fusil. À 20 px une arme longue devient une tache
//    horizontale — c'est vrai de presque tous les jeux d'icônes, et c'est la
//    raison pour laquelle ils prennent tous une cible. L'anneau et les quatre
//    ergots survivent à n'importe quelle réduction.
I.SK_Shooting = c =>
    cut(circ(32, 32, 21), c('clair'), K(circ(32, 32, 14)))
  + fill('M29,4h6v12h-6Z', c('clair'))                      // ergots
  + fill('M29,48h6v12h-6Z', c('clair'))
  + fill('M4,29h12v6h-12Z', c('clair'))
  + fill('M48,29h12v6h-12Z', c('clair'))
  + fill(circ(32, 32, 5), c('ombre'));

// -- corps à corps : une épée pointe en haut. La garde est ce qui la sépare
//    d'un simple triangle, et le pommeau ce qui l'empêche de flotter.
I.SK_Melee = c => rot(35, 32, 32,
    fill('M32,6l4,8v26h-8V14Z', c('clair'))                 // lame
  + fill('M20,41h24v5h-24Z', c('ombre'))                    // garde
  + fill('M29,46h6v9h-6Z', c('clair'))                      // fusée
  + fill(circ(32, 57, 4), c('ombre')));                     // pommeau

// -- construction : marteau. La truelle d'avant se lisait comme une flèche vers
//    le bas — un triangle pointe en bas n'appartient à personne. Le marteau, lui,
//    tient à sa tête franchement décentrée sur le manche : c'est ce déséquilibre
//    qui le nomme, pas le détail.
I.SK_Construction = c => rot(22, 32, 32,
    fill('M12,12h30v16h-30Z', c('clair'))                    // tête
  + fill('M42,14l8,4v6l-8,4Z', c('ombre'))                   // panne
  + fill('M22,28h8v28h-8Z', c('clair')));                    // manche

// -- minage : pioche. La version symétrique se lisait comme un PARAPLUIE, et
//    c'était imparable : un arc centré sur un manche vertical, c'est exactement
//    un parapluie. Deux corrections, l'une et l'autre nécessaires — la tête est
//    dissymétrique (pointe d'un côté, tranchant de l'autre), et l'ensemble est
//    basculé en diagonale, axe sur lequel aucun parapluie ne se tient.
I.SK_Mining = c => rot(-28, 32, 32,
    fill('M6,30l24,-9l26,4l-3,7l-23,-2l-22,7Z', c('clair'))  // tête
  + fill('M27,26h9v32h-9Z', c('ombre')));                    // manche

// -- cuisine : marmite. Deux anses, un couvercle, et de la vapeur — sans la
//    vapeur elle se lit comme un seau.
I.SK_Cooking = c =>
    fill('M14,32h36v14a8,8 0 0,1 -8,8h-20a8,8 0 0,1 -8,-8Z', c('clair'))
  + fill('M10,30h44v5h-44Z', c('clair'))                     // couvercle
  + fill(circ(32, 26, 3), c('ombre'))                        // bouton
  + line('M9,36q-4,3 0,6', c('ombre'), 3)                    // anses
  + line('M55,36q4,3 0,6', c('ombre'), 3)
  + line('M24,20q3,-4 0,-8', c('ombre'), 3)                  // vapeur
  + line('M40,20q3,-4 0,-8', c('ombre'), 3);

// -- plantes : une pousse à deux feuilles. Deux corrections par rapport au
//    premier jet : le trait de sol est supprimé, parce qu'avec la tige il
//    dessinait un « T » qui mangeait toute la lecture ; et les feuilles sont
//    plus charnues et inclinées, là où des lentilles plates disparaissaient.
I.SK_Plants = c =>
    line('M32,58q0,-16 0,-26', c('ombre'), 5)
  + rot(-30, 18, 30, fill(lens(18, 30, 28, 22), c('clair')))
  + rot(30, 46, 20, fill(lens(46, 20, 28, 22), c('clair')));

// -- animaux : empreinte. Quatre doigts d'inclinaisons différentes, sinon la
//    patte se lit comme quatre points alignés.
I.SK_Animals = c =>
    fill('M32,52q-14,0 -14,-10q0,-10 14,-10t14,10q0,10 -14,10Z', c('clair'))
  + rot(-18, 17, 24, fill(vlens(17, 24, 10, 15), c('clair')))
  + rot(-6, 26, 18, fill(vlens(26, 18, 10, 16), c('clair')))
  + rot(6, 38, 18, fill(vlens(38, 18, 10, 16), c('clair')))
  + rot(18, 47, 24, fill(vlens(47, 24, 10, 15), c('clair')));

// -- artisanat : roue dentée. Le moyeu doit être ÉVIDÉ, pas plus sombre : à
//    20 px un moyeu plein fait de la roue un disque à bords irréguliers.
I.SK_Crafting = c =>
  cut(roue(32, 32, 26, 20, 8), c('clair'), K(circ(32, 32, 9)));

// -- art : pinceau, en biais. La virole métallique est ce qui le distingue
//    d'un crayon, et la goutte dit que ça peint.
I.SK_Artistic = c => rot(35, 32, 32,
    fill('M29,8h6v28h-6Z', c('clair'))                       // manche
  + fill('M27,36h10v7h-10Z', c('ombre'))                     // virole
  + fill('M27,43h10l-5,13Z', c('clair')))                    // soies
  + fill(drop(50, 50, 9, 12), c('ombre'));                   // goutte

// -- médecine : croix aux bras arrondis. Une croix à angles vifs se lit comme
//    un signe « plus » ; les congés en font un symbole.
I.SK_Medicine = c =>
  fill('M26,10h12a4,4 0 0,1 4,4v12h12a4,4 0 0,1 4,4v4a4,4 0 0,1 -4,4h-12v12'
     + 'a4,4 0 0,1 -4,4h-12a4,4 0 0,1 -4,-4v-12h-12a4,4 0 0,1 -4,-4v-4'
     + 'a4,4 0 0,1 4,-4h12v-12a4,4 0 0,1 4,-4Z', c('clair'));

// -- social : deux bulles qui se répondent. Leurs queues pointent l'une VERS
//    l'autre : dans l'autre sens on lit deux monologues.
I.SK_Social = c =>
    fill(bulle(24, 24, 30, 20, 1), c('clair'))
  + fill(bulle(40, 42, 26, 18, -1), c('ombre'));

// -- intellect : fiole. Le col étroit et les épaules obliques la séparent du
//    gobelet de « drunken », qui est évasé du haut.
I.SK_Intellectual = c =>
    fill('M27,8h10v16l13,24a6,6 0 0,1 -5,9h-26a6,6 0 0,1 -5,-9l13,-24Z', c('clair'))
  + fill('M24,10h16v4h-16Z', c('ombre'))                     // col
  + fill(circ(28, 46, 3), c('ombre'))
  + fill(circ(37, 42, 2), c('ombre'));

const SKILLS = ['Shooting', 'Melee', 'Construction', 'Mining', 'Cooking', 'Plants',
                'Animals', 'Crafting', 'Artistic', 'Medicine', 'Social', 'Intellectual'];
const dirSkill = `${base}/_tools/svg/Skills`;
fs.mkdirSync(dirSkill, { recursive: true });
for (const n of SKILLS) {
  uid = 0;
  fs.writeFileSync(`${dirSkill}/${n}.svg`, head + I['SK_' + n](mono) + '</svg>');
  uid = 0;
  fs.writeFileSync(`${dirs.sil}/SK_${n}.svg`, head + I['SK_' + n](() => '#000') + '</svg>');
}
console.log(`${SKILLS.length} icones de competence ecrites`);

// ====================================================== TYPES DE TRAVAIL
// Les 23 WorkTypeDef de vanilla et des DLC. Même règle que les compétences :
// monochrome, la forme seule.
//
// Neuf d'entre eux REPRENNENT le dessin de leur compétence. Ce n'est pas de la
// paresse : « Cuisinier » et « Cuisine » désignent le même domaine, et leur
// donner deux glyphes différents ferait croire à deux notions. Les quatorze
// autres n'ont pas de compétence — ou pas la même — et sont dessinés ici.
const MEME_QUE = {
  Art: 'Artistic', Construction: 'Construction', Cooking: 'Cooking',
  Crafting: 'Crafting', Doctor: 'Medicine', Growing: 'Plants',
  Handling: 'Animals', Mining: 'Mining', Research: 'Intellectual',
};

// -- pompier : une flamme à deux tons. La version pleine se lisait comme une
//    GOUTTE D'EAU, ce qui est le contresens parfait pour un pompier : ce qui
//    fait une flamme, ce n'est pas son contour, c'est son cœur plus sombre.
//    Même construction que le « critical » des passions, qui lui se lit bien.
I.WT_Firefighter = c =>
    fill('M34,3q2,14 10,21q9,11 4,23q-4,11 -16,11q-13,0 -17,-11q-4,-11 3,-19'
       + 'q-1,8 3,11q-5,-16 13,-36Z', c('clair'))
  + fill('M33,28q1,7 6,12q4,6 1,12q-3,6 -8,6q-7,0 -8,-7q-1,-6 3,-10'
       + 'q0,4 2,5q-2,-9 4,-18Z', c('ombre'));

// -- travaux simples : un interrupteur. Ce type couvre ce qui ne demande aucune
//    compétence — actionner, ouvrir, éteindre.
I.WT_BasicWorker = c =>
    fill('M14,22h36a11,11 0 0,1 0,22h-36a11,11 0 0,1 0,-22Z', c('clair'))
  + fill(circ(42, 33, 8), c('ombre'));

// -- puériculture : biberon. La graduation est ce qui l'empêche d'être un
//    simple flacon.
I.WT_Childcare = c =>
    fill('M22,28h20v22a7,7 0 0,1 -7,7h-6a7,7 0 0,1 -7,-7Z', c('clair'))
  + fill('M23,21h18v7h-18Z', c('ombre'))
  + fill('M28,7q4,-5 8,0v14h-8Z', c('clair'))
  + fill('M26,36h8v3h-8Z', c('ombre'))
  + fill('M26,43h8v3h-8Z', c('ombre'));

// -- nettoyage : balai. Les brins s'évasent : un rectangle droit se lisait
//    comme un maillet.
I.WT_Cleaning = c => rot(18, 32, 32,
    fill('M29,4h6v30h-6Z', c('ombre'))
  + fill('M22,34h20l6,22h-32Z', c('clair'))
  + fill('M23,42h18v3h-18Z', c('ombre')));

// -- étude des ténèbres : un œil à pupille fendue. Le premier jet s'aplatissait
//    en tache et se confondait avec le poisson. Deux corrections : l'œil est
//    moins étiré, et la pupille est un DISQUE sombre fendu de clair — un
//    contraste interne, là où la fente sombre seule remplissait tout l'œil.
I.WT_DarkStudy = c =>
    fill(lens(32, 32, 46, 34), c('clair'))
  + fill(circ(32, 32, 11), c('ombre'))
  + fill(vlens(32, 32, 6, 20), c('clair'));

// -- pêche : poisson. La queue triangulaire porte à elle seule la lecture,
//    l'œil ne sert qu'à dire de quel côté est la tête.
I.WT_Fishing = c =>
    fill(lens(27, 32, 38, 26), c('clair'))
  + fill(poly([[44, 32], [58, 21], [58, 43]]), c('clair'))
  + fill(circ(18, 29, 3), c('ombre'));

// -- manutention : une caisse et une flèche. Sans la flèche, c'est du stockage ;
//    avec elle, c'est un déplacement.
I.WT_Hauling = c =>
    fill('M32,4l11,13h-7v7h-8v-7h-7Z', c('clair'))
  + fill('M11,28h42v26h-42Z', c('clair'))
  + fill('M11,37h42v5h-42Z', c('ombre'));

// -- chasse : un arc bandé. Le premier jet se lisait comme un bouton « retour » :
//    l'arc bombé à gauche et la pointe à droite formaient une seule chevron.
//    L'EMPENNAGE règle la question — deux barbes à l'arrière donnent un sens de
//    lecture qu'aucune chevron n'a. L'arc est aussi affiné pour que la flèche
//    domine, et non l'inverse.
I.WT_Hunting = c =>
    arc(48, 32, 26, 128, 232, 4, c('ombre'))
  + line('M32,10v44', c('ombre'), 2)
  + fill('M10,30h34v4h-34Z', c('clair'))
  + fill(poly([[40, 24], [58, 32], [40, 40]]), c('clair'))
  + fill(poly([[10, 22], [18, 30], [10, 30]]), c('clair'))
  + fill(poly([[10, 42], [18, 34], [10, 34]]), c('clair'));

// -- patient : une gélule. Recevoir un soin, ce n'est pas le prodiguer : la
//    croix reste au médecin.
I.WT_Patient = c => rot(-35, 32, 32,
    fill('M16,24h32a10,10 0 0,1 0,20h-32a10,10 0 0,1 0,-20Z', c('clair'))
  + fill('M16,24h16v20h-16a10,10 0 0,1 0,-20Z', c('ombre')));

// -- repos au lit : un lit. Le dosseret et les pieds sont ce qui le sépare
//    d'une simple barre horizontale.
I.WT_PatientBedRest = c =>
    fill('M6,16h6v30h-6Z', c('clair'))
  + fill('M6,30h50v10h-50Z', c('clair'))
  + fill('M14,21h14v9h-14Z', c('ombre'))
  + fill('M8,40h6v10h-6Z', c('clair'))
  + fill('M48,40h6v10h-6Z', c('clair'));

// -- coupe des plantes : sécateur. Les deux anneaux disent l'outil ; deux
//    lames croisées toutes seules feraient une croix de Saint-André.
I.WT_PlantCutting = c =>
    line('M22,8L42,38', c('clair'), 6)
  + line('M42,8L22,38', c('clair'), 6)
  + cut(circ(19, 48, 9), c('ombre'), K(circ(19, 48, 4)))
  + cut(circ(45, 48, 9), c('ombre'), K(circ(45, 48, 4)));

// -- forge : enclume. Le marteau est déjà pris par la construction, et c'est
//    l'enclume qui dit le métal de toute façon.
I.WT_Smithing = c =>
    fill('M8,22h34l10,-6v6h4v10h-8l-5,6h-14l-4,-6h-17Z', c('clair'))
  + fill('M24,38h14l9,16h-32Z', c('ombre'));

// -- confection : un vêtement. La bobine et son fil se lisaient comme la lettre
//    « Ɖ » — trop de traits fins pour 20 px. Le résultat du travail dit le
//    travail mieux que son outil, et une silhouette de tunique ne ressemble à
//    rien d'autre dans le jeu d'icônes.
I.WT_Tailoring = c =>
    fill('M24,10h16l16,9l-5,11l-7,-4v28h-24v-28l-7,4l-5,-11Z', c('clair'))
  + fill('M26,10h12l-6,7Z', c('ombre'));

// -- surveillance : une clé. Les barreaux d'une cellule se réduisent à des
//    traits parallèles, illisibles ; la clé garde sa forme à toute taille.
I.WT_Warden = c =>
    cut(circ(17, 32, 13), c('clair'), K(circ(17, 32, 6)))
  + fill('M28,28h28v8h-28Z', c('clair'))
  + fill('M42,36h5v9h-5Z', c('ombre'))
  + fill('M52,36h4v7h-4Z', c('ombre'));

const WORKTYPES = ['Art', 'BasicWorker', 'Childcare', 'Cleaning', 'Construction',
  'Cooking', 'Crafting', 'DarkStudy', 'Doctor', 'Firefighter', 'Fishing', 'Growing',
  'Handling', 'Hauling', 'Hunting', 'Mining', 'Patient', 'PatientBedRest',
  'PlantCutting', 'Research', 'Smithing', 'Tailoring', 'Warden'];
const dirWT = `${base}/_tools/svg/WorkTypes`;
fs.mkdirSync(dirWT, { recursive: true });
for (const n of WORKTYPES) {
  const dessin = MEME_QUE[n] ? 'SK_' + MEME_QUE[n] : 'WT_' + n;
  if (!I[dessin]) throw new Error(`dessin introuvable pour le type de travail ${n}`);
  uid = 0;
  fs.writeFileSync(`${dirWT}/${n}.svg`, head + I[dessin](mono) + '</svg>');
  uid = 0;
  fs.writeFileSync(`${dirs.sil}/WT_${n}.svg`, head + I[dessin](() => '#000') + '</svg>');
}
console.log(`${WORKTYPES.length} icones de type de travail ecrites`
  + ` (${Object.keys(MEME_QUE).length} reprises d'une competence)`);
