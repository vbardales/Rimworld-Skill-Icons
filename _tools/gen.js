// Generates the 34 distinct icons, as SVG, in Oracle's graphic language.
// node gen.js  ->  ../svg/*.svg   and   ./sil/*.svg (black silhouettes, readability test)
const fs = require('fs');

// ---------------------------------------------------------------- palette
const P = {
  red:'#CC362F', grey:'#939393',
  greenP:'#387F36', orangeP:'#F79839', leaf:'#5AA83F',
  ice:'#6FBBDD', frost:'#D8F0FA', amber:'#E8A33D', purple:'#A96FC4',
  lav:'#B39DDB', pink:'#E07A9F', steel:'#8FA0B0', toxic:'#7CB342',
  gold:'#E0B54A', cream:'#D9C9A3', slate:'#5F7C8A',
  crimson:'#A3202B', greyPurple:'#8A7F94',
  iceP:'#6FBBDD',   // same blue, but used as the main shape (frozen)
  amberP:'#E8A33D', // drunken's glass: amber carries the shape
  silver:'#B8C4CE', // vengeful's blade, lighter than dormant steel
  flash:'#FFF6D0',  // pain-driven's flash of pain, two frames out of twenty-four
  neon:'#4FE8D8',   // transhumanist's signal trail
  blanc:'#F4F8FA',  // its bright head
  trace:'#14595C',  // DARK trace: in light silver, the neon dots stopped
                    // standing out once the chip turned teal.
                    // A bright signal demands a trace darker than itself.
                    // A DELIBERATELY DEEP colour: as an
                    // accessory they would take the same grey as the machine
                    // half and disappear in the Work tab
  ghost:'#4A4A4A',  // the "None" passion: present, but ghostly

  // ------------------------------------------------------------------------
  // ONE HUE PER PASSION, spread across the whole colour wheel.
  //
  // This is the single most important fix this set has had: 21 icons out of
  // 40 had a red mass and a small coloured accessory. At 24 px the accessory
  // disappears, and all that was left was a row of near-identical red blobs.
  // The hue must carry the identity, not the accessory.
  tDedicated:'#B4462F',    // brick red
  tObsessive:'#C2185B',    // magenta
  tSynergistic:'#1FA5A0',  // turquoise
  tFrozen:'#9FDCF2',       // very light glacier blue
  tNight:'#2E4A8C',        // night blue
  tDrunken:'#E0A02E',      // amber
  tYouth:'#F2726B',        // coral pink
  tVengeful:'#8E1F22',     // dark red
  tForbidden:'#4A4258',    // very dark violet
  tNomadic:'#D9B54A',      // ochre
  tSanguine:'#B3121C',     // blood red
  tToxic:'#8FD130',        // acid green
  tPain:'#FF7A1A',         // electric orange
  tBlind:'#E8E0CC',        // ivory
  tCompetitive:'#C9962C',  // deep gold: the body must be DARKER than
                           // the crown, otherwise the two blend together
  orClair:'#F7DE7A',       // the crown's light gold
  tDunce:'#8A6B54',        // taupe brown
  tIdeological:'#F08A70',  // salmon pink, close to the Ideology symbol
  tIntimate:'#E86BA0',     // pink
  tLikeMinded:'#6FC7D6',   // soft cyan
  tRainy:'#4C86C4',        // rain blue
  tStoned:'#7A8B3A',       // olive green
  tTranshuman:'#1F8A86',   // deep teal. The table's bright cyan
                           // would make the bright cyan dots running
                           // across the chip invisible: same family, but dark
                           // enough for them to stand out.
  tTraumatic:'#6B7F8C',    // desaturated blue-grey
  tNudist:'#F0A878',       // peach
};

// Two greys for the Work tab grid, two steels for the dormant states. In
// both cases: the main shape takes the light value, the accessory the dark
// one - flattening to a single value destroys the crown, the padlock and
// the snowflake.
const PRIMARY = ['red','purple','lav','toxic','slate','greyPurple','pink','iceP',
                 'amberP','greenP','orangeP','trace',
                 'tDedicated','tObsessive','tSynergistic','tFrozen','tNight','tDrunken',
                 'tYouth','tVengeful','tForbidden','tNomadic','tSanguine','tToxic',
                 'tPain','tBlind','tCompetitive','tDunce','tIdeological','tIntimate',
                 'tLikeMinded','tRainy','tStoned','tTranshuman','tTraumatic','tNudist'];
const GREY   = k => PRIMARY.includes(k) ? '#939393' : '#6B6B6B';

// Two independent axes, because a single one cannot carry both pieces of
// information without identity and speed treading on each other:
//
//   HUE says which passion       - toxic green, night blue, amber
//   SATURATION says how fast you learn
//   STEEL says the bonus is asleep (the untriggered state of a triggered passion)
//
// NEUTRAL, no longer the blue-tinted steel #8FA0B0: a blue-grey belongs to
// the same hue family as frozen's, night's or blind's blue, and so read as
// a thematic colour instead of a state.
const DORMANT = k => PRIMARY.includes(k) ? '#8C8C8C' : '#606060';

// blends two colours. Takes colours ALREADY resolved by the palette, so
// that the grey variant blends between two greys and stays grey.
const melange = (h1, h2, t) => {
  const p = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const [a, b] = [p(h1), p(h2)];
  return '#' + a.map((v, i) =>
    Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

// desaturates toward luminance: the hue survives, the intensity drops
const fade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  const m = v => Math.round(v + (l - v) * f).toString(16).padStart(2, '0');
  return '#' + m(r) + m(g) + m(b);
};

// --------- speed carried by BOTH saturation and lightness, continuously
//
// The four previous rungs had three measurable flaws: a cliff between 1.99
// and 2 where the real gap is negligible; 1.25, 1.5 and 1.75 all rendered
// identically; and, worse, light hues (gold) looking stronger than dark
// ones (crimson) at equal speed, since only saturation was touched.
//
// Hence the SHARED lightness target: at equal speed, icons converge toward
// the same clarity regardless of their hue. That is what keeps the
// progression readable in a grid where passions of different hues sit next
// to each other.
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
// Deliberate highlights escape the ramp: their role is to be vivid, not to
// say a speed.
const REHAUTS = ['flash', 'blanc', 'frost'];
// DELIBERATELY SHALLOW amplitude: speed is only a suggestion. The hierarchy
// is hue = the passion's identity, lightness = active or dormant state,
// shape = confirmation. A wide ramp made slow hues so dull they stopped
// being identifiable - speed was eating identity.
const bande = lrf => {
  const t = Math.max(0, Math.min(1, (lrf || 0) / 3));
  return k => {
    if (REHAUTS.includes(k)) return P[k];
    const [h, s, l] = versHsl(P[k]);
    return versHex([h, s * (0.78 + 0.22 * t), l + ((0.42 + 0.12 * t) - l) * 0.25]);
  };
};

// learnRateFactor per file, read off the defs (maximum when several defs
// share the same texture, e.g. blind elevated/sublime)
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

// ---------------------------------------------- the two canonical shapes
const HEART = 'M32,52C32,52 10,36.5 10,23C10,16.6 14.9,12 20.6,12'
            + 'C25.6,12 29.7,15 32,19C34.3,15 38.4,12 43.4,12'
            + 'C49.1,12 54,16.6 54,23C54,36.5 32,52 32,52Z';
const FLAME = 'M32,11C40,22 47,28 47,36C47,44.5 40.5,51 32,51'
            + 'C23.5,51 17,44.5 17,36C17,28 24,22 32,11Z';

// maps every absolute coordinate pair (M/C/Z path commands only)
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
// ring: a ~4 px band, measured pixel by pixel on Oracle's icons
const heartRing = (s = 1, dx = 0, dy = 0) => heart(s, dx, dy) + heart(s * 0.8, dx, dy);
// flame with its own flame hollowed out, like Oracle's "critical"
const flame = (s = 1, dx = 0, dy = 0) =>
  xf(FLAME, s, dx, dy) + xf(FLAME, s * 0.46, dx, dy + s * 7);

// ------------------------------------------------------------- primitives
const circ = (cx, cy, r) =>
  `M${cx - r},${cy}A${r},${r} 0 1,0 ${cx + r},${cy}A${r},${r} 0 1,0 ${cx - r},${cy}Z`;
const poly = pts => 'M' + pts.map(p => p.join(',')).join('L') + 'Z';
const lens = (cx, cy, w, h) =>
  `M${cx - w / 2},${cy}Q${cx},${cy - h / 2} ${cx + w / 2},${cy}`
  + `Q${cx},${cy + h / 2} ${cx - w / 2},${cy}Z`;
// the same lens, pointed at top and bottom (ears)
const vlens = (cx, cy, w, h) =>
  `M${cx},${cy - h / 2}Q${cx + w / 2},${cy} ${cx},${cy + h / 2}`
  + `Q${cx - w / 2},${cy} ${cx},${cy - h / 2}Z`;
const drop = (cx, cy, w, h) => {
  const r = w / 2, by = cy + h / 2 - r;
  return `M${cx},${cy - h / 2}Q${cx + r},${cy - h / 6} ${cx + r},${by}`
       + `A${r},${r} 0 1,1 ${cx - r},${by}Q${cx - r},${cy - h / 6} ${cx},${cy - h / 2}Z`;
};
// Maple leaf: normalised half-profile (tip at 0,-1; petiole base at 0,+1),
// mirrored. Its sharp side points come from the narrowing, where a vine
// leaf's rounded lobes would merge into a blob.
// The NOTCH radius is what decides everything: too short, and each lobe
// becomes a spike and the leaf reads as a star. Here the notches stay
// around 0.6 of the radius while the points reach 0.8-1.0, which leaves a
// central mass and gives the lobes some body.
const MAPLE = [
  [0.00, -1.00], [0.20, -0.62], [0.46, -0.66], [0.44, -0.34],
  [0.74, -0.34], [0.62, -0.10], [1.00, -0.02], [0.56, 0.20],
  [0.62, 0.46], [0.32, 0.42], [0.12, 0.58], [0.05, 1.00],
];
// `petiole` set to false drops the last point: the leaf ends on a straight
// edge instead of a point, and only points downward.
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
// scales an arbitrary SVG fragment, around the box's centre
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
const cut = (shape, col, holes, eo) => {           // `holes` is removed from `shape`
  const id = 'm' + (++uid);
  return `<mask id="${id}"><rect width="64" height="64" fill="#fff"/>${holes}</mask>`
       + `<path d="${shape}"${eo ? ' fill-rule="evenodd"' : ''} fill="${col}" mask="url(#${id})"/>`;
};
const K = d => `<path d="${d}" fill="#000"/>`;      // hole

// ------------------------------------------------------------ the icons
const I = {};

// -- the absence of passion, as an option. Outline only, thin, in a dark
//    grey: present without competing with the others. A deliberate
//    exception to the saturation scale - None learns at 0.35 while apathy
//    is at 0.25, so the rule would want it lighter; but ten skills out of
//    twelve carry it, and if it draws the eye the real passions stop
//    standing out.
I.PassionNone = c => fill(heartRing(0.76), c('ghost'), true);

// -- the two vanilla passions. They have to be redrawn here because VSE
//    routes their grid icon to UI/Icons/Passion*Gray, i.e. RimWorld's own
//    textures: without these files, the Work tab keeps showing the base
//    game's flames next to our hearts.
// `fr`: two close beats then a pause - "battement" mode. The obvious
// gesture for a full heart, and the vanilla top rung can beat plainly.
I.PassionMajor = (c, fr) => {
  const BAT = [1.11, 1.05, 1, 1.08, 1.03, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  return fill(xf(HEART, fr ? BAT[fr.i % BAT.length] : 1), c('red'));
};
// `fr`: the fill level rises then falls - "montee" mode. Six pixels of
// travel: below that, nothing shows at the game's actual size.
I.PassionMinor = (c, fr) => {
  const y = fr ? 35 - 6 * (1 - Math.cos(2 * Math.PI * fr.i / fr.n)) / 2 : 35;
  return fill(heartRing(), c('red'), true) + halfCut(heart(), c('red'), y);
};
// -- "apathy": the grey outline. `fr` melts it - "fonte" mode. It sags on
//    its point while widening, until it is nothing but a line on the
//    ground, then reforms. It is the very picture of interest draining away.
// WAX. It melts from the top - the heart consumes itself, the matter piles
// up on the ground - then re-forms from the top down. A plain squash read
// as "flattened"; what makes it melting is that the matter goes somewhere.
//
// A single horizontal cut line is enough for both halves of the cycle: on
// the melt, keep what is BELOW it; on the reform, what is ABOVE it.
I.PassionApathy = (c, fr) => {
  const anneau = fill(heartRing(), c('grey'), true);
  if (!fr) return anneau;
  const gris = c('grey'), i = fr.i;

  // THE RING IS ALWAYS DRAWN, and on top of the sand. That precaution is
  // what matters: without it, at the top of the cycle you would get a full
  // heart, i.e. "major" in grey in the Work tab. The hollow outline says
  // apathy at all times, only the level inside moves.
  //
  // And because the outline never changes shape, the silhouette holds at
  // 24 px - which the melt did not, since it destroyed it mid-cycle. The
  // RHYTHM says apathy as much as the shape does: a surge that fills in
  // three frames, drains in five, and forty frames of empty - five sixths
  // of the cycle. A steady back-and-forth told of swaying, not giving up.
  // No plateau at the top: barely full, it is already draining.
  let niveau;                       // y of the sand's surface
  // ceiling at 21, not 13: even at the top there is still a hollow under
  // the outline, otherwise you would get a full grey heart, i.e. "major"
  // in the grid
  if (i <= 2) niveau = 53 - 32 * (i / 2);              // it fills all at once
  else if (i <= 7) niveau = 21 + 32 * ((i - 2) / 5);   // and drains right away
  else niveau = 53;                                    // then nothing

  const id = 'sable' + (++uid);
  const sable = niveau < 52
    ? `<mask id="${id}"><rect x="0" y="${niveau.toFixed(1)}" width="64" height="64"`
      + ` fill="#fff"/></mask><path d="${heart(0.8)}" fill="${gris}" mask="url(#${id})"/>`
    : '';
  // The two flows OVERLAP: it is already draining from the bottom by f1
  // while it is still draining from the top until f3. That is more
  // accurate - a leaking container does not fill first and empty only
  // afterwards.
  // The thickness varies: the stream swells when the flow is strong, thins
  // as it runs dry.
  const HAUT = { 0: 2.6, 1: 2.6, 2: 2.0, 3: 1.2 };
  const BAS  = { 1: 1.2, 2: 2.0, 3: 2.8, 4: 2.8, 5: 2.2, 6: 1.4 };
  const filet = (w, y, h) => w
    ? `<rect x="${(32 - w / 2).toFixed(2)}" y="${y}" width="${w}" height="${h}"`
      + ` rx="${(w / 2).toFixed(2)}" fill="${gris}"/>` : '';
  return sable + anneau + filet(HAUT[i], 0, 14) + filet(BAS[i], 50, 14);
};

// -- "natural": a green heart with a leaf hollowed out of it. `fr` makes it
//    turn and breathe, as if caught by a breeze - "brise" mode.
// The leaf flies off the heart, loops around, and comes back in from the
// other side.
//
// The trick: it is drawn TWICE, with inverted masks. Where it overlaps the
// heart, it is a hole; everywhere else, it is solid. The hollow/solid
// switch therefore happens on its own as it crosses the edge, with no
// frame having to decide it.
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

// `fr`: the inner flame roars, then an aura of six rays bursts out -
// "surchauffe" mode. It sits at the top of the vanilla scale, it has earned it.
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

// -- VSE's "critical": the flame passes THROUGH the heart instead of
//    replacing it. Like the six other vanilla/VSE icons (major, minor,
//    apathy, natural...), it is entirely redrawn here: the mod reuses no
//    texture at all.

// -- a heart missing a quarter. The full outline is still traced: without
//    it you cannot see what is missing, only a lopsided shape.
// `fr`: the missing quarter partly fills in then reopens - "elan" mode. It
// never closes all the way: a whole heart would be "major".
I.AS_DedicatedPassion = (c, fr) => {
  const x = fr ? 33 + 9 * (1 - Math.cos(2 * Math.PI * fr.i / fr.n)) / 2 : 33;
  return fill(heartRing(), c('tDedicated'), true)
    + cut(heart(), c('tDedicated'),
          `<rect x="${x.toFixed(2)}" y="3" width="30" height="27" rx="5" fill="#000"/>`);
};

// -- a hollowed-out spiral: fixation
// `fr` spins the spiral - "spirale" mode. It winds a whole number of
// turns, so a full rotation loops without a seam.
I.AS_ObsessivePassion = (c, fr) => {
  const pts = [];
  for (let t = 0; t <= 3.2 * Math.PI; t += 0.1) {
    const r = 1.5 + 2.05 * t;
    pts.push(`${(32 + r * Math.cos(t)).toFixed(2)},${(31 + r * Math.sin(t)).toFixed(2)}`);
  }
  const a = fr ? 360 * fr.i / fr.n : 0;
  return cut(heart(), c('tObsessive'), rot(a, 32, 31, line('M' + pts.join('L'), '#000', 5)));
};

// -- a heart broadcasting toward another: the radiance becomes directional,
//    otherwise the composition was confused with intimate's two hearts
// `fr` swells the wave - "onde" mode. One arc, then two, then three, then
// it starts over from a single one - the radiance gains ground in stages.
// A Newton's cradle, in hearts. The three in the middle NEVER move: that is
// exactly what the passion says - the impulse crosses the row without
// disturbing it and comes out the other side.
I.AS_SynergisticPassion = (c, fr) => {
  // NEITHER a frame NOR strings: those are one-pixel lines, they would
  // crush everything else at the game's actual size. Four touching hearts
  // are enough - the middle two never move, the outer ones swing out in turn.
  const X = [13.5, 26, 38.5, 51], D = 7;
  let gauche = 0, droite = 0;
  if (fr) {
    const q = fr.n / 4, i = fr.i;
    if (i < q)          gauche = -D * Math.cos((i / q) * Math.PI / 2);
    else if (i < 2 * q) droite = D * Math.sin(((i - q) / q) * Math.PI / 2);
    else if (i < 3 * q) droite = D * Math.cos(((i - 2 * q) / q) * Math.PI / 2);
    else                gauche = -D * Math.sin(((i - 3 * q) / q) * Math.PI / 2);
  } else {
    droite = D;   // at rest, one heart stays swung out: otherwise it reads as a row of beads
  }
  return [X[0] + gauche, X[1], X[2], X[3] + droite]
    .map(x => fill(heart(0.284, x - 32, 0), c('tSynergistic'))).join('');
};

// -- a snowflake resting on a heart of ice
// `fr` grows frost needles along the heart's edge - "givre" mode. The
// snowflake itself does not move - it is the reference icon, seeing it
// appear and disappear would read as a display glitch.
I.AS_FrozenPassion = (c, fr) => {
  // `fr` makes snow fall - "neige" mode. Four offset snowflakes drifting
  // downward. The frost needles I first put on the heart's edge did not
  // read well - falling snow does.
  const neige = fr
    ? [[13, 0, 2.4], [25, 0.3, 1.8], [51, 0.55, 2.1], [40, 0.8, 1.6]].map(([x, ph, r]) => {
        const u = ((fr.i / fr.n) + ph) % 1;
        // from -6 to 70: the flake enters and leaves the frame, so the loop
        // seam is hidden by the edge instead of being a visible jump
        return circ(x + 2.5 * Math.sin(4 * Math.PI * u), -6 + 76 * u, r);
      }).join('')
    : '';
  return fill(heart(0.84, -5, -4), c('tFrozen'))
    + (neige ? fill(neige, c('frost')) : '')
    + [0, 60, 120].map(a => rot(a, 43, 41,
        `<rect x="30" y="38.5" width="26" height="5" rx="2.5" fill="${c('frost')}"/>`)).join('');
};

// -- the crescent dominates, the heart nests inside it, a star to finish it off.
//    `fr` (frame number) makes the star twinkle - "twinkle" mode.
I.AS_NightPassion = (c, fr) => {
  // amplitude raised from ±28% to ±48%: below that, the star twinkled by
  // half a pixel and nobody could see it
  const k = fr ? 1 + 0.48 * Math.sin(2 * Math.PI * fr.i / fr.n) : 1;
  // A MASK, not fill-rule="evenodd". Evenodd fills the SYMMETRIC
  // difference: the part of the inner circle that overflows the outer
  // circle was therefore also painted, making a second moon on the right.
  // Two circles in evenodd never make a crescent - at best a ring, when the
  // inner one is entirely contained.
  return cut(circ(29, 33, 21), c('ice'), K(circ(39, 33, 19)))
    + fill(heart(0.34, 12, 5), c('tNight'))
    + `<g id="star" transform="translate(50 11) scale(${k}) translate(-50 -11)">`
    + fill(star4(50, 11, 8, 2.8), c('cream')) + '</g>';
};

// -- the champagne glass. `fr` makes the bubbles rise above the rim
//    ("champagne" mode): they can only live between y=2 and y=17, below the
//    rim they would drown in the bowl's amber.
I.AS_DrunkenPassion = (c, fr) => {
  const t = fr ? fr.i / fr.n : 0;
  const bulle = (x, r0, dephasage) => {
    const u = (t + dephasage) % 1;              // 0 = just born, 1 = bursts
    // the radius falls to zero: the bubble bursts instead of vanishing in one jump
    return `<circle cx="${x}" cy="${(17 - 15 * u).toFixed(2)}"`
         + ` r="${(r0 * (1 - u)).toFixed(2)}"/>`;
  };
  const verre = fill('M10,18H54C53,30 44,38 32,38C20,38 11,30 10,18Z', c('tDrunken'))
    + `<rect x="29.5" y="37" width="5" height="12" fill="${c('tDrunken')}"/>`
    + `<rect x="17" y="48" width="30" height="5.5" rx="2.7" fill="${c('tDrunken')}"/>`
    // the heart is what is inside the glass
    + fill(heart(0.38, 0, -6), c('red'))
    + `<g id="bubbles" fill="${c('tDrunken')}">`
    + bulle(27, 3.6, 0) + bulle(37, 3.0, 0.38) + bulle(45, 2.6, 0.71) + '</g>';
  // the glass sways on its stem: the bubbles alone did not say drunkenness
  return fr ? rot(4.5 * Math.sin(2 * Math.PI * t), 32, 53, verre) : verre;
};

// -- a heart within a heart: an ardour that will burn out by growing
// `fr`: the inner heart grows to fill the outline, then both vanish at once
// and it all starts over - "croissance" mode. That is the very meaning of
// the passion: it burns out as it grows, at fifteen.
I.AS_YouthPassion = (c, fr) => {
  if (!fr) return fill(heartRing(), c('tYouth'), true) + fill(heart(0.4), c('tYouth'));
  // The fruit ripens as it grows: green, then orange, then red.
  const mur = t => t < 0.5 ? melange(c('leaf'), c('orangeP'), t * 2)
                           : melange(c('orangeP'), c('tYouth'), (t - 0.5) * 2);
  // ROUND TRIP: the outline never moves, only the inner heart grows as it
  // ripens then shrinks back as it turns green again. The loop's seam is
  // then continuous by construction - the previous version made both
  // shapes vanish, and the last frame jumped straight to the first.
  const demi = fr.n / 2;
  const t = fr.i <= demi ? fr.i / demi : (fr.n - fr.i) / demi;
  return fill(heartRing(), c('tYouth'), true)
    + fill(heart(0.35 + 0.5 * t), mur(t));
};

// -- the blade: a cracked heart read as heartbreak, not vengeance
I.AS_VengefulPassion = (c, fr) =>
  // `fr`: the blade withdraws, strikes, then rises back - "frappe" mode.
  // The offset is applied INSIDE the already-tilted group, so the dagger
  // slides along its own axis rather than vertically.
  ((fr) => {
    // INSTANT strike, slow withdrawal: the blade jumps from -5 to +8 in a
    // single frame, then takes six frames to come back. The reverse -
    // advancing gradually - gave a limp push, not a blow.
    const FRAPPE = { 8: -2, 9: -5, 10: 8, 11: 7.2, 12: 6.2, 13: 5, 14: 3.8, 15: 2.6 };
    const d = fr ? (FRAPPE[fr.i] ?? 0) : 0;
    return fill(heart(0.94, 0, -1), c('tVengeful'))
      + rot(24, 32, 32, `<g transform="translate(0 ${d})">`
          + fill(poly([[32, 3], [36.5, 17], [36.5, 38], [27.5, 38], [27.5, 17]]), c('silver'))
          + `<rect x="17" y="38" width="30" height="7" rx="3" fill="${c('silver')}"/>`
          + `<rect x="28" y="45" width="8" height="14" rx="3" fill="${c('slate')}"/></g>`);
  })(fr);

// -- padlock shackle + keyhole
// `fr` makes the shackle gape open - "cadenas" mode. It pivots on its right
// leg, like a real padlock, opens for six frames out of twenty-four then
// closes again.
I.AS_ForbiddenPassion = (c, fr) => {
  // The shackle is a U whose BOTH legs plunge down to y=27, i.e. below the
  // heart's upper edge (y≈18), which is drawn on top: they are therefore
  // buried in the body, like on a real padlock.
  //
  // Opening means pivoting on the right leg's foot: the left leg rises and
  // COMES OUT of the heart. It is that extraction you read, not the
  // rotation. Without legs - a plain arch resting on top - there was
  // nothing to pull out.
  const OUVRE = { 15: 20, 16: 42, 17: 62, 18: 70, 19: 70, 20: 62, 21: 42, 22: 18 };
  const a = fr ? (OUVRE[fr.i] ?? 0) : 0;
  const anse = `<path d="M24,27L24,16A8,8 0 0,1 40,16L40,27" fill="none"`
             + ` stroke="${c('steel')}" stroke-width="6" stroke-linecap="round"/>`;
  return rot(a, 40, 27, anse)
    + cut(heart(0.88, 0, 5), c('tForbidden'),
          K(circ(32, 33, 5.5)) + K(poly([[29, 34], [35, 34], [37.5, 46], [26.5, 46]])));
};

// -- a wayfinding star
// `fr`: the star crosses the icon from bottom to top, born and extinguished
// along the way - "voyage" mode. The original `rotate` tilted the whole
// thing by 4 degrees, which is nothing at all; a nomadic passion has to
// travel, not just quiver.
I.AS_NomadicPassion = (c, fr) => {
  const t = fr ? fr.i / fr.n : 0;
  const k = fr ? Math.sin(Math.PI * t) : 1;
  return fill(heart(0.74, -6, 5), c('tNomadic'))
    + (k > 0.08
        ? fill(star4(14 + 34 * t, 46 - 32 * t, 14 * k, 4.5 * k), c('cream'))
        : '');
};

// -- a drop of blood hanging from the tip
I.AS_SanguinePassion = (c, fr) =>
  // `fr`: one drop grows at the tip while the previous one falls, in
  // opposite phase - "saignee" mode. The static icon is unchanged.
  ((fr) => {
    const goutte = u => u < 0.5
      ? drop(32, 52, 13 * u * 2, 18 * u * 2)              // forms at the tip
      : drop(32, 52 + 26 * (u - 0.5) * 2, 13, 18);        // breaks off and falls
    const g = fr
      ? goutte((fr.i / fr.n) % 1) + goutte(((fr.i / fr.n) + 0.5) % 1)
      : drop(32, 52, 13, 18);
    return fill(heart(0.88, 0, -6), c('tSanguine')) + fill(g, c('crimson'));
  })(fr);

// -- a heart gnawed from within, a bite on its side
// `fr` drifts the three holes until they form two orbits and a nose -
// "crane" mode. They hold position for ten frames, line up, hold, then
// scatter - the skull surfaces without ever settling in.
I.AS_ToxicPassion = (c, fr) => {
  // 40 frames at 6 i/s: the skull is HELD for ten frames instead of six,
  // and rests for sixteen. At 24 frames and 8 i/s the morph chained too
  // fast and flickered.
  const rampe = i => i < 16 ? 0 : i < 22 ? (i - 16) / 6 : i < 32 ? 1 : 1 - (i - 32) / 8;
  const u = fr ? (1 - Math.cos(Math.PI * rampe(fr.i))) / 2 : 0;
  const l = (a, b) => a + (b - a) * u;
  // The orbits: discs at rest, ellipses TILTED toward the nose on arrival.
  // A skull does not have round eyes - it is the tilt that signs it.
  const oeil = (x0, y0, x1, y1, sens) => {
    const x = l(x0, x1), y = l(y0, y1);
    return rot(sens * 24 * u, x, y,
      `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}"`
      + ` rx="${l(6.5, 6).toFixed(2)}" ry="${l(6.5, 8.2).toFixed(2)}" fill="#000"/>`);
  };
  const yeux = oeil(23, 30, 23.5, 27, -1) + oeil(38, 39, 40.5, 27, 1);
  // The mouth: the third disc shrinks while a smile opens - concave
  // downward, so the corners RISE.
  // Thin and RAISED: at radius 16 and thickness 5 it dropped down to y=46
  // and devoured the heart's tip, whose gnawed bottom stopped reading. Here
  // it stops at y=43 and leaves the heart's last nine pixels intact.
  const bouche = K(circ(l(29, 32), l(46, 43), 4.5 * (1 - u)))
    + (u > 0.12 ? arc(32, 29, 14, 90 - 45 * u, 90 + 45 * u, 3, '#000') : '');
  // The nose: a triangle pointing up, between and below the orbits.
  const nez = u > 0.3
    ? K(poly([[32, 39 - 6 * u], [32 + 4 * u, 39], [32 - 4 * u, 39]])) : '';
  return cut(heart(), c('tToxic'), yeux + bouche + nez + K(circ(58, 26, 8)))
    + fill(circ(48, 13, 4) + circ(55, 6, 2.8), c('tToxic'));
};

// -- the lightning bolt: the scratches went to traumatic, where they say the scar better
// `fr` triggers a flash of pain - "eclair" mode. Two frames out of
// twenty-four, the bolt whitens and swells - a discharge, not a blink.
I.AS_PainDrivenPassion = (c, fr) => {
  const eclat = fr && (fr.i === 20 || fr.i === 21);
  const bolt = fill(poly([[43, 3], [25, 31], [34, 31], [21, 59], [42, 29], [33, 29]]),
                    eclat ? c('flash') : c('gold'));
  return fill(heart(0.86, 0, 0), c('tPain')) + (eclat ? scaleG(1.14, 0, 0, bolt) : bolt);
};

// -- the eye, a heart standing in for the iris
// `fr` makes the eye blink - "blink" mode. The opening stays full for
// almost the whole cycle and only closes for three frames - a blink, not a tic.
// The heart-iris is cut to the eye's own shape, otherwise it would poke out
// past the eyelids at the moment they close.
// Alpha Skills gives the SAME iconPath to both blindness tiers, so they
// cannot be told apart by eye. Patches/AlphaSkills_Fixes.xml redirects the
// sublime tier to this gold-iris variant - it is the higher tier (1x/2x
// against 0.5x/1.5x), and its flavour text speaks of nobility.
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

// -- crown
// `fr` lowers the crown onto the heart then raises it to crown it -
// "couronnement" mode. It is drawn after the heart, so it passes in front
// of it at the low point and simply ends up resting on it at the high point.
I.AS_CompetitivePassion = (c, fr) => {
  const dy = fr ? 7 * (1 - Math.cos(2 * Math.PI * fr.i / fr.n)) / 2 : 0;
  return fill(heart(0.8, 0, 6), c('tCompetitive'))
    + `<g transform="translate(0 ${dy.toFixed(2)})">`
    + fill(poly([[19, 22], [19, 7], [26, 15], [32, 5], [38, 15], [45, 7], [45, 22]]), c('orClair'))
    + '</g>';
};

// -- the donkey cap actually resting on the heart, its two ears standing up.
//    The band overhangs the heart on both sides: that is what stops it
//    reading as an animal head rather than a hat.
I.AS_DuncePassion = (c, fr) =>
  // The cap is split into two points by a deep notch - not two ears bolted
  // onto a band, which read as an animal's head. It stays narrower than the
  // heart, and the notch separates it from competitive's three-pointed crown.
  //
  // The two points are cut from the body so that one can droop on its own:
  // `fr` bends it then straightens it back up - "oreille" mode.
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

// -- Ideology's flame standing atop the heart
I.AS_IdeologicalPassion = (c, fr) =>
  // Ideology's own flame, drawn the way the game draws it - it rises and
  // curls inward - standing above the heart. The heart serves as its base,
  // and is what tells it apart from moody_greater's and
  // psychic_critical's flames once the hue is gone.
  // `fr` swaps the two positions then swaps them back - "permutation" mode.
  // The cycle holds at rest, swaps, holds, returns - rather than a
  // continuous back-and-forth.
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

// -- two hearts plainly overlapping, not side by side
// `fr` orbits them around each other - "ronde" mode. Draw order flips
// halfway through, otherwise the same heart would forever stay behind and
// the dance would read as a plain sway.
I.AS_IntimatePassion = (c, fr) => {
  const t = fr ? fr.i / fr.n : 0;
  const a = (220 + 360 * t) * Math.PI / 180, R = 7.8;
  const A = fill(heart(0.6, R * Math.cos(a), R * Math.sin(a)), c('tIntimate'));
  const B = fill(heart(0.6, -R * Math.cos(a), -R * Math.sin(a)), c('tIntimate'));
  return Math.sin(a) > 0 ? B + A : A + B;
};

// -- two strictly identical hearts, joined by an equals sign.
//    `fr` grows two more behind them, which grow then fade - "essaimage"
//    mode. They stay small and set back - the pair and its equals sign must
//    stay what you read first.
I.AS_LikeMindedPassion = (c, fr) => {
  // The two hearts first beat in OPPOSITION then fall into sync, before
  // drifting apart again. That is the very meaning of the passion: two
  // minds falling into step. The earlier swarm effect - hearts budding
  // behind them - said nothing about synchrony.
  const t = fr ? fr.i / fr.n : 0;
  const decalage = 0.25 * (1 + Math.cos(2 * Math.PI * t));   // 0.5 -> 0 -> 0.5
  const battement = ph => 1 + 0.13 * Math.sin(2 * Math.PI * (3 * t + ph));
  const g = fr ? battement(0) : 1, d = fr ? battement(decalage) : 1;
  return fill(heart(0.4 * g, -16, 0), c('tLikeMinded'))
    + fill(heart(0.4 * d, 16, 0), c('tLikeMinded'))
    + `<rect x="26" y="26" width="12" height="4.5" rx="2.2" fill="${c('steel')}"/>`
    + `<rect x="26" y="34" width="12" height="4.5" rx="2.2" fill="${c('steel')}"/>`;
};

// ---- "moody" scale: the wavy line signs the changing mood
const wave = col => line('M13,54Q18.5,47 24,54T35,54T46,54T57,54', col, 5);
const halfCut = (d, col, y) =>
  cut(d, col, `<rect x="0" y="0" width="64" height="${y}" fill="#000"/>`);
// The five rungs, from flattest to most fervent. Apathy keeps its flat
// curve: that is its own sign, and the only rung that is not violet.
const CRAN_MOODY = [
  c => fill(heartRing(0.8, 0, -5), c('greyPurple'), true)
     + line('M14,54H56', c('greyPurple'), 5),
  c => fill(heartRing(0.8, 0, -5), c('purple'), true) + wave(c('purple')),
  c => fill(heartRing(0.8, 0, -5), c('purple'), true)
     + halfCut(heart(0.8, 0, -5), c('purple'), 28) + wave(c('purple')),
  c => fill(heart(0.8, 0, -5), c('purple')) + wave(c('purple')),
  // same principle as at the top of the psychic scale: the flame is
  // hollowed out of the heart, it does not replace it
  c => cut(heart(0.8, 0, -5), c('purple'), K(xf(FLAME, 0.4, 0, -4.2)))
     + wave(c('purple')),
];
// `fr` lets the mood wander around the current rung then brings it back -
// "humeur" mode. It is the only passion whose very meaning is to fluctuate,
// so the only one where varying the icon itself says something accurate.
// 32 frames at 6 i/s, a cycle just over five seconds, and each rung HELD
// five to ten frames. At 16 frames and 8 i/s, the level changed every two
// frames: four jumps a second, and since every jump changes the whole
// shape, it flickered instead of fluctuating.
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

// ---- "psychic" scale: the ring, doubling up at the higher degrees
const halo  = (col, r = 22, w = 4.5) => arc(32, 32, r, 0, 359.9, w, col);
const ticks = (col, a = 0) =>
  [45, 135, 225, 315].map(b => arc(32, 32, 29, b + a - 6, b + a + 6, 4.5, col)).join('');
// `fr`: the ring widens as it thins, then starts over from the centre -
// "onde" mode. The old `pulse` moved by 2.5% of scale, i.e. half a pixel at
// the game's actual size: there was a sequence, but nothing to see.
// TWO waves in opposite phase, and a thickness that falls to zero at the
// edge. With a single wave and a linear ramp, the cycle restarted abruptly:
// it did not loop. Here one is born as the other fades out.
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
// The top of the scale keeps its heart: the flame there is HOLLOWED OUT,
// like in the redrawn vanilla "critical". A bare flame lost the heart.
I.AS_PsychicPassion_Critical  = (c, fr) => cut(heart(0.66), c('lav'), K(xf(FLAME, 0.33, 0, 0.66)))
                                         + onde(c, fr, 'lav')
                                         + ticks(c('lav'), fr ? 90 * fr.i / fr.n : 0);

// -- three drops at the base: the silhouette changes, not just the hue
// `fr` drops the raindrops in a staggered loop - "pluie" mode. Without
// `fr`, the static icon stays exactly what was already validated.
I.AS_RainyDayPassion = (c, fr) => {
  // The drops cross the ENTIRE height, from -8 to 72: drawn after the
  // heart, they pass in front of it. Before, they fell from 43 to 63, i.e.
  // entirely below it - they never crossed it.
  // The loop seam is hidden by the edges, as with the snow.
  // The phases are DECORRELATED from the x positions: with 0/0.34/0.67 for
  // increasing x, the drops fell in order and it swept left to right
  // instead of raining. Here the fall order is 15, 41, 28, 50.
  // The third one crosses TWICE per cycle: a different speed breaks the
  // regularity, and a whole number of crossings keeps the loop clean.
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

// -- dizziness: one crisp heart, two offset ghosts. A wisp of smoke was the
//    weak link of this set; double vision says the state better.
//    `fr` breathes the gap between the ghosts - "vertige" mode.
//    `fr`: the three hearts orbit on a flattened ellipse and, above all,
//    the draw order follows the depth - the one in front passes behind and
//    vice versa. It is that exchange that makes the dizziness, not the
//    movement itself.
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
    .sort((p, q) => p.z - q.z)          // the one furthest forward is drawn last
    .map(p => p.d).join('');
};

// -- the leaf, right where you would expect it
I.AS_NudistPassion = (c, fr) => {
  // v: 0 the leaf is in place, 1 it is out of frame and the heart is bare
  const envol = i => i < 10 ? 0 : i < 15 ? (i - 9) / 5 : i < 19 ? 1 : 1 - (i - 18) / 5;
  const v = fr ? envol(fr.i) : 0;
  return (
  // Two small bare legs under the heart, each ending in a foot: that is
  // what says it is nude. They are drawn BEFORE the heart, which hides
  // where they start - they only emerge below the point.
  //
  // `fr` makes the leaf fly off, and the heart blushes at the cheeks while
  // it is exposed - "envol" mode. The leaf leaves the frame through the
  // top rather than fading out - a fade is not part of this set's language.
  [-1, 1].map(s =>
    `<rect x="${32 + s * 6 - 2.6}" y="36" width="5.2" height="16" rx="2.2" fill="${c('tNudist')}"/>`
    + `<rect x="${s > 0 ? 34.4 : 21.4}" y="49.5" width="8.2" height="5.6" rx="2.6" fill="${c('tNudist')}"/>`
  ).join('')
  + fill(heart(0.9, 0, -6), c('tNudist'))
  // The leaf sits ON the heart, small and centred: the heart stays whole
  // and the leaf reads as what it covers.
  + (v > 0.02
      ? fill(circ(23, 24, 4.6 * v) + circ(41, 24, 4.6 * v), c('pink'))
      : '')
  + (v < 0.98
      ? rot(46 * v, 32, 38, `<g transform="translate(${(11 * v).toFixed(2)} ${(-62 * v).toFixed(2)})">`
          + fill(maple(32, 38, 11.5, 10, -1, false), c('leaf')) + '</g>')
      : ''));
};

// -- half flesh, half machine
// `fr` lights up the chips one after another - "puces" mode. The neon
// touches only one chip at a time - lighting all three at once would look
// like a blinker.
// Half flesh, half CHIP. The gear teeth used before said nothing: a chip
// is traces, nodes and pins. The pins overhang the heart on the right,
// which gives the icon a silhouette that belongs to it.
// `fr` lights up the nodes one after another along the traces - "puces" mode.
I.AS_TranshumanistPassion = (c, fr) => {
  // TWO traces crossing the WHOLE heart, flesh half included - the circuit
  // is no longer confined to the metal. Orthogonal and 45-degree segments,
  // as on a real printed circuit: it is that geometry that signs it.
  // Drawn within the heart's real width at each height, otherwise they
  // overflow it (it is only 18 px wide at y=42).
  const PISTES = [
    [[13, 28], [21, 28], [27, 34], [37, 34], [43, 28], [51, 28]],
    [[23, 43], [23, 38], [29, 32], [37, 32], [43, 38], [43, 43]],
  ];
  const mesure = P2 => {
    const seg = P2.slice(1).map(([x, y], k) => Math.hypot(x - P2[k][0], y - P2[k][1]));
    return [seg, seg.reduce((a, b) => a + b, 0)];
  };
  // point located at fraction s along the path
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
  // Four points in total, phase-shifted across the two traces: they cross
  // paths instead of filing along in a line, which makes for a living
  // circuit rather than a convoy.
  const POINTS = [[0, 0], [0, 0.5], [1, 0.25], [1, 0.7]];
  const signal = POINTS.map(([p, ph]) => {
    const [x, y] = pointSur(PISTES[p], t + ph);
    return fill(circ(x, y, 2.8), c('neon')) + fill(circ(x, y, 1.4), c('blanc'));
  }).join('');
  return cut(heart(), c('red'), `<rect x="32" y="0" width="32" height="64" fill="#000"/>`)
    + cut(heart(), c('tTranshuman'), `<rect x="0" y="0" width="32" height="64" fill="#000"/>`)
    // the pins, along the right flank
    + [[50, 19], [52, 28], [47, 38]].map(([x, y]) =>
        `<rect x="${x}" y="${y}" width="9" height="4" rx="2" fill="${c('tTranshuman')}"/>`).join('')
    // the two traces, and their pads at the elbows
    + PISTES.map(P2 =>
        line('M' + P2.map(p => p.join(',')).join('L'), c('trace'), 2.2, 'round')
        + P2.map(([x, y]) => fill(circ(x, y, 2.2), c('trace'))).join('')).join('')
    + signal;
};

// -- the scars: the bandage was confused with the lightning bolt in silhouette
I.AS_TraumaticPassion = c =>
  cut(heart(), c('tTraumatic'), rot(-38, 32, 32,
    [0, 1, 2].map(k => `<rect x="${11 + k * 14}" y="-10" width="5.5" height="84" fill="#000"/>`).join('')));

// ------------------------------------------------------------------ output
//
// The 34 drawings become the 74 files Alpha Skills asks for. Only three
// palettes, applied according to the def's learning speed:
//   ACTIVE  = its own colours          (learnRateFactor > 1, live bonus)
//   DORMANT = two steels               (learnRateFactor <= 1, sleeping bonus)
//   GREY    = two greys                (Work tab variants)

const base = 'C:/Users/nelim/Documents/rimworld/SkillIcons';
const dirs = { svg: `${base}/_tools/svg/Passions`, sil: `${base}/_tools/sil` };
Object.values(dirs).forEach(d => fs.mkdirSync(d, { recursive: true }));

const ACTIVE = k => P[k];

// triggered families: the plain file carries the vivid colour, the variant sleeps
const VIF = {
  AS_DrunkenPassion: '_Inactive', AS_NightPassion: '_Inactive',
  AS_NomadicPassion: '_Inactive', AS_PainDrivenPassion: '_Inactive',
  AS_SanguinePassion: '_Inactive', AS_StonedPassion: '_Inactive',
  AS_ToxicPassion: '_Inactive', AS_VengefulPassion: '_Inactive',
  AS_CompetitivePassion: '_Off', AS_RainyDayPassion: '_Off',
};
// reversed families: the plain file sleeps, it is _Active that lights up
const DORT = ['AS_BlindPassion', 'AS_IdeologicalPassion', 'AS_IntimatePassion',
              'AS_NudistPassion', 'AS_TranshumanistPassion'];
// passions with no triggered state, whose bonus is permanent (lrf > 1)
const FIXE_VIF = ['AS_DedicatedPassion', 'AS_ForbiddenPassion', 'AS_ObsessivePassion',
                  'AS_YouthPassion',
                  // a deliberate exception: lrf = 1, but learnRateFactorOther = 1.1,
                  // the bonus is real, it just applies to other skills
                  'AS_SynergisticPassion'];
// passions with no triggered state and no speed gain (lrf <= 1): cold palette
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
// passions with no triggered state: no steel, saturation alone speaks
for (const n of [...FIXE_VIF, ...FIXE_TERNE, 'AS_FrozenPassion']) {
  emit(n, n, teinte(n));
  emit(n + 'Grey', n, GREY);
}

// The two five-degree scales become the rule's best demonstration rather
// than an exception: a constant family hue, saturation rising with speed -
// from apathy at 0.1 up to the flame at 2.
for (const f of ['Moody', 'Psychic']) {
  Object.keys(I).filter(k => k.startsWith(`AS_${f}Passion`))
    .forEach(k => emit(k, k, teinte(k)));
  emit(`AS_${f}PassionGrey`, `AS_${f}Passion`, GREY);
}

// the VSE icons this mod redraws
emit('PassionCritical', 'PassionCritical', ACTIVE);
emit('PassionCriticalGrey', 'PassionCritical', GREY);
emit('PassionMajor', 'PassionMajor', ACTIVE);
emit('PassionMinor', 'PassionMinor', ACTIVE);
emit('PassionNatural', 'PassionNatural', ACTIVE);
emit('PassionNaturalGrey', 'PassionNatural', GREY);
emit('PassionApathy', 'PassionApathy', ACTIVE);
// blindness's sublime tier, redirected by patch to its own texture
emit('AS_BlindPassionSublime', 'AS_BlindPassionSublime', DORMANT);
emit('AS_BlindPassionSublime_Active', 'AS_BlindPassionSublime', teinte('AS_BlindPassion_Active'));

// And the same under RimWorld's own paths: that is where VSE looks for the
// grid icon of "interested" and "burning". Without this, the Work tab
// mixes our hearts with the base game's flames.
const dirUI = `${base}/_tools/svg/UI`;
fs.mkdirSync(dirUI, { recursive: true });
for (const [nom, dessin, res] of [
  ['PassionMajor', 'PassionMajor', ACTIVE], ['PassionMajorGray', 'PassionMajor', GREY],
  ['PassionMinor', 'PassionMinor', ACTIVE], ['PassionMinorGray', 'PassionMinor', GREY],
]) {
  uid = 0;
  fs.writeFileSync(`${dirUI}/${nom}.svg`, head + I[dessin](res) + '</svg>');
}
// and the absence of passion, which the DLL only serves if the option is checked
emit('PassionNone', 'PassionNone', ACTIVE);

console.log(`${out.length} SVG files written (from ${Object.keys(I).length} drawings)`);

// ------------------------------------------------------- animation frames
//
// The counts and modes reproduce EXACTLY SkillIcons.dll's Specs table
// (PassionIconAnimations.cs): the DLL loads Passions/Animated/<key>_<NN>
// and stops at the hardcoded count. A count that drifts falls the passion
// back to its static icon.
// Counts doubled compared to the first version, and framerates doubled with
// them: the loop's duration is unchanged, the movement is twice as fine.
// Any change here must be carried over into Specs, on the C# side.
const SPECS = [
  // mood runs the whole scale and returns to its notch
  ['AS_MoodyPassion', 32, 'humeur'], ['AS_MoodyPassion_Apathy', 32, 'humeur'],
  ['AS_MoodyPassion_NoPassion', 32, 'humeur'], ['AS_MoodyPassion_Major', 32, 'humeur'],
  ['AS_MoodyPassion_Greater', 32, 'humeur'],
  // a gesture of its own for each passion
  ['AS_BlindPassion_Active', 24, 'blink'],
  ['AS_BlindPassionSublime_Active', 24, 'blink'],          // the eye blinks
  ['AS_CompetitivePassion', 16, 'couronnement'],    // the crown descends
  ['AS_ForbiddenPassion', 24, 'cadenas'],           // the shackle gapes
  ['AS_FrozenPassion', 24, 'givre'],                // the frost grows
  ['AS_IdeologicalPassion_Active', 24, 'permutation'],
  ['AS_IntimatePassion_Active', 24, 'ronde'],       // the two hearts chase each other
  ['AS_LikeMindedPassion', 24, 'essaimage'],
  ['AS_NudistPassion_Active', 24, 'envol'],         // the leaf flies off, it blushes
  ['AS_ObsessivePassion', 24, 'spirale'],
  ['AS_PainDrivenPassion', 24, 'eclair'],           // flash of pain
  ['AS_RainyDayPassion', 24, 'pluie'],
  ['AS_SanguinePassion', 24, 'saignee'],
  ['AS_StonedPassion', 12, 'vertige'],              // the front and back swap
  ['AS_SynergisticPassion', 24, 'pendule'],            // ) then )) then )))
  ['AS_ToxicPassion', 40, 'crane'],
  ['AS_TranshumanistPassion_Active', 16, 'signal'],
  ['AS_TraumaticPassion', 16, 'tremble'],
  ['AS_VengefulPassion', 16, 'frappe'],
  ['AS_YouthPassion', 24, 'croissance'],
  ['PassionCritical', 16, 'surchauffe'],
  ['AS_DedicatedPassion', 16, 'elan'],
  ['AS_DuncePassion', 24, 'oreille'],
  // The four that had a sequence but moved by half a pixel: they now have a
  // gesture of their own, like the others.
  ['AS_NightPassion', 16, 'twinkle'],      // the star truly twinkles now
  ['AS_NomadicPassion', 16, 'voyage'],     // the star crosses the frame
  ['AS_DrunkenPassion', 16, 'champagne'],  // the glass sways as well as the bubbles
  ['AS_PsychicPassion', 20, 'onde'], ['AS_PsychicPassion_Minor', 20, 'onde'],
  ['AS_PsychicPassion_Nullified', 20, 'onde'],
  ['AS_PsychicPassion_Major', 20, 'onde'], ['AS_PsychicPassion_Critical', 20, 'onde'],
  // and the three vanilla passions that had nothing at all
  ['PassionMajor', 16, 'battement'], ['PassionMinor', 16, 'montee'],
  ['PassionNatural', 24, 'envolFeuille'], ['PassionApathy', 48, 'fonte'],
];

// Keys carrying a state suffix name the bare drawing; the others do not.
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
    // traumatic's fear: three shudders per cycle, wide enough to survive at
    // 24 px where a one-pixel shift would not show
    // Fear in BURSTS: still, then a sharp shudder on the last six frames. In
    // a continuous motion at ±2.8 px - i.e. 1 px at the game's actual size -
    // the tremor was invisible; in a burst and at ±5 px, it shows.
    case 'tremble': {
      if (i < n - 6) return '';
      const v = Math.sin(3 * Math.PI * (i - (n - 6)) / 6);
      return `translate(${(5 * v).toFixed(2)} 0) rotate(${(3.5 * v).toFixed(2)} 32 46)`;
    }
    default:       return '';   // twinkle and champagne animate their own content
  }
};

const frameDir = `${base}/_tools/svg/Frames`;
fs.mkdirSync(frameDir, { recursive: true });
let nb = 0;
for (const [cle, n, mode] of SPECS) {
  const dessin = dessinDe(cle);
  if (!I[dessin]) throw new Error(`no drawing found for key ${cle}`);
  for (let i = 0; i < n; i++) {
    uid = 0;
    // PassionCritical and PassionNone are not on Alpha Skills' scale: no
    // learnRateFactor to apply to them, they keep their full colour.
    const teinteFrame = LRF[cle] !== undefined ? bande(LRF[cle]) : ACTIVE;
    const corps = I[dessin](teinteFrame, { i, n });
    const t = transform(mode, i, n);
    const svg = head + (t ? `<g transform="${t}">${corps}</g>` : corps) + '</svg>';
    fs.writeFileSync(`${frameDir}/${cle}_${String(i).padStart(2, '0')}.svg`, svg);
    nb++;
  }
}
console.log(`${nb} animation frames written (${SPECS.length} sequences)`);

// =========================================================== SKILLS
// The twelve vanilla SkillDefs. A SEPARATE set from the passions, and
// deliberately MONOCHROME: in this mod colour already means "which
// passion", and having it also mean "which skill" would make both
// unreadable. Here shape alone carries the identity - which amounts to
// applying the icon set's rule 2 (readable in silhouette) as the sole rule.
//
// Only two tones: a light mass, a shadow for internal detail. At 20 px the
// second tone no longer reads as a colour but as a hollow, which is what
// keeps the icon from flattening into a blob.
const OUTIL = { clair: '#D6D6D6', ombre: '#8F8F8F' };
const mono = k => OUTIL[k];

// gear wheel: n square teeth between inner radius r and outer radius R
const roue = (cx, cy, R, r, n) => poly(Array.from({ length: n * 4 }, (_, k) => {
  const pas = 2 * Math.PI / (n * 4);
  const a = k * pas - Math.PI / 2;
  const rad = (k % 4 === 0 || k % 4 === 3) ? R : r;
  return [+(cx + rad * Math.cos(a)).toFixed(2), +(cy + rad * Math.sin(a)).toFixed(2)];
}));

// speech bubble with its tail
const bulle = (cx, cy, w, h, sens = 1) =>
  `M${cx - w / 2},${cy - h / 2}h${w}a4,4 0 0,1 4,4v${h - 8}a4,4 0 0,1 -4,4`
  + `h${-(w / 2 - 4 * sens)}l${-5 * sens},6l${sens > 0 ? 0.5 : -0.5},-6`
  + `h${-(w / 2 + 4 * sens - 4)}a4,4 0 0,1 -4,-4v${-(h - 8)}a4,4 0 0,1 4,-4Z`;

// -- shooting: a reticle, not a rifle. At 20 px a long gun becomes a
//    horizontal smear - true of almost every icon set, and the reason they
//    all reach for a target. The ring and the four ticks survive any
//    reduction.
I.SK_Shooting = c =>
    cut(circ(32, 32, 21), c('clair'), K(circ(32, 32, 14)))
  + fill('M29,4h6v12h-6Z', c('clair'))                      // ticks
  + fill('M29,48h6v12h-6Z', c('clair'))
  + fill('M4,29h12v6h-12Z', c('clair'))
  + fill('M48,29h12v6h-12Z', c('clair'))
  + fill(circ(32, 32, 5), c('ombre'));

// -- melee: a sword pointing up. The guard is what separates it from a
//    plain triangle, and the pommel what keeps it from floating.
I.SK_Melee = c => rot(35, 32, 32,
    fill('M32,6l4,8v26h-8V14Z', c('clair'))                 // blade
  + fill('M20,41h24v5h-24Z', c('ombre'))                    // guard
  + fill('M29,46h6v9h-6Z', c('clair'))                      // grip
  + fill(circ(32, 57, 4), c('ombre')));                     // pommel

// -- construction: a hammer. The trowel used before read as a downward
//    arrow - a triangle pointing down belongs to nobody. The hammer holds
//    on its head sitting frankly off-centre on the handle: that imbalance
//    is what names it, not the detail.
I.SK_Construction = c => rot(22, 32, 32,
    fill('M12,12h30v16h-30Z', c('clair'))                    // head
  + fill('M42,14l8,4v6l-8,4Z', c('ombre'))                   // peen
  + fill('M22,28h8v28h-8Z', c('clair')));                    // handle

// -- mining: a pickaxe. The symmetrical version read as an UMBRELLA, and it
//    was unassailable: an arc centred on a vertical handle IS an umbrella.
//    Two fixes, both necessary - the head is asymmetric (a point on one
//    side, an edge on the other), and the whole thing is tilted diagonally,
//    an axis no umbrella ever stands on.
I.SK_Mining = c => rot(-28, 32, 32,
    fill('M6,30l24,-9l26,4l-3,7l-23,-2l-22,7Z', c('clair'))  // head
  + fill('M27,26h9v32h-9Z', c('ombre')));                    // handle

// -- cooking: a pot. Two handles, a lid, and steam - without the steam it
//    reads as a bucket.
I.SK_Cooking = c =>
    fill('M14,32h36v14a8,8 0 0,1 -8,8h-20a8,8 0 0,1 -8,-8Z', c('clair'))
  + fill('M10,30h44v5h-44Z', c('clair'))                     // lid
  + fill(circ(32, 26, 3), c('ombre'))                        // knob
  + line('M9,36q-4,3 0,6', c('ombre'), 3)                    // handles
  + line('M55,36q4,3 0,6', c('ombre'), 3)
  + line('M24,20q3,-4 0,-8', c('ombre'), 3)                  // steam
  + line('M40,20q3,-4 0,-8', c('ombre'), 3);

// -- plants: a two-leaved sprout. Two fixes from the first pass: the
//    ground line is dropped, because together with the stem it drew a "T"
//    that ate the whole reading; and the leaves are plumper and tilted,
//    where flat lenses disappeared.
I.SK_Plants = c =>
    line('M32,58q0,-16 0,-26', c('ombre'), 5)
  + rot(-30, 18, 30, fill(lens(18, 30, 28, 22), c('clair')))
  + rot(30, 46, 20, fill(lens(46, 20, 28, 22), c('clair')));

// -- animals: a paw print. Four toes at different tilts, otherwise the paw
//    reads as four aligned dots.
I.SK_Animals = c =>
    fill('M32,52q-14,0 -14,-10q0,-10 14,-10t14,10q0,10 -14,10Z', c('clair'))
  + rot(-18, 17, 24, fill(vlens(17, 24, 10, 15), c('clair')))
  + rot(-6, 26, 18, fill(vlens(26, 18, 10, 16), c('clair')))
  + rot(6, 38, 18, fill(vlens(38, 18, 10, 16), c('clair')))
  + rot(18, 47, 24, fill(vlens(47, 24, 10, 15), c('clair')));

// -- crafting: a gear wheel. The hub must be HOLLOWED, not just darker: at
//    20 px a solid hub turns the wheel into a disc with irregular edges.
I.SK_Crafting = c =>
  cut(roue(32, 32, 26, 20, 8), c('clair'), K(circ(32, 32, 9)));

// -- art: a paintbrush, tilted. The metal ferrule is what sets it apart
//    from a pencil, and the drop says it paints.
I.SK_Artistic = c => rot(35, 32, 32,
    fill('M29,8h6v28h-6Z', c('clair'))                       // handle
  + fill('M27,36h10v7h-10Z', c('ombre'))                     // ferrule
  + fill('M27,43h10l-5,13Z', c('clair')))                    // bristles
  + fill(drop(50, 50, 9, 12), c('ombre'));                   // drop

// -- medicine: a cross with rounded arms. A sharp-cornered cross reads as a
//    plus sign; the rounded joins make it a symbol.
I.SK_Medicine = c =>
  fill('M26,10h12a4,4 0 0,1 4,4v12h12a4,4 0 0,1 4,4v4a4,4 0 0,1 -4,4h-12v12'
     + 'a4,4 0 0,1 -4,4h-12a4,4 0 0,1 -4,-4v-12h-12a4,4 0 0,1 -4,-4v-4'
     + 'a4,4 0 0,1 4,-4h12v-12a4,4 0 0,1 4,-4Z', c('clair'));

// -- social: two speech bubbles answering each other. Their tails point
//    TOWARD each other: the other way round reads as two monologues.
I.SK_Social = c =>
    fill(bulle(24, 24, 30, 20, 1), c('clair'))
  + fill(bulle(40, 42, 26, 18, -1), c('ombre'));

// -- intellectual: a flask. The narrow neck and sloped shoulders set it
//    apart from drunken's tumbler, which flares at the top.
I.SK_Intellectual = c =>
    fill('M27,8h10v16l13,24a6,6 0 0,1 -5,9h-26a6,6 0 0,1 -5,-9l13,-24Z', c('clair'))
  + fill('M24,10h16v4h-16Z', c('ombre'))                     // neck
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
console.log(`${SKILLS.length} skill icons written`);

// ====================================================== WORK TYPES
// The 23 vanilla and DLC WorkTypeDefs. Same rule as the skills: monochrome,
// shape alone.
//
// Nine of them REUSE their skill's drawing. That is not laziness: "Cook"
// and "Cooking" name the same domain, and giving them two different glyphs
// would imply two notions. The fourteen others have no skill - or not the
// same one - and are drawn here.
const MEME_QUE = {
  Art: 'Artistic', Construction: 'Construction', Cooking: 'Cooking',
  Crafting: 'Crafting', Doctor: 'Medicine', Growing: 'Plants',
  Handling: 'Animals', Mining: 'Mining', Research: 'Intellectual',
};

// -- firefighter: a two-tone flame. The solid version read as a WATER DROP,
//    which is the perfect opposite for a firefighter: what makes a flame
//    is not its outline, it is its darker core. Same construction as the
//    passions' "critical", which reads well.
I.WT_Firefighter = c =>
    fill('M34,3q2,14 10,21q9,11 4,23q-4,11 -16,11q-13,0 -17,-11q-4,-11 3,-19'
       + 'q-1,8 3,11q-5,-16 13,-36Z', c('clair'))
  + fill('M33,28q1,7 6,12q4,6 1,12q-3,6 -8,6q-7,0 -8,-7q-1,-6 3,-10'
       + 'q0,4 2,5q-2,-9 4,-18Z', c('ombre'));

// -- basic work: a switch. This work type covers what needs no skill at
//    all - operate, open, shut off.
I.WT_BasicWorker = c =>
    fill('M14,22h36a11,11 0 0,1 0,22h-36a11,11 0 0,1 0,-22Z', c('clair'))
  + fill(circ(42, 33, 8), c('ombre'));

// -- childcare: a baby bottle. The graduation marks are what keeps it from
//    being a plain flask.
I.WT_Childcare = c =>
    fill('M22,28h20v22a7,7 0 0,1 -7,7h-6a7,7 0 0,1 -7,-7Z', c('clair'))
  + fill('M23,21h18v7h-18Z', c('ombre'))
  + fill('M28,7q4,-5 8,0v14h-8Z', c('clair'))
  + fill('M26,36h8v3h-8Z', c('ombre'))
  + fill('M26,43h8v3h-8Z', c('ombre'));

// -- cleaning: a broom. The bristles flare out - a straight rectangle read
//    as a mallet.
I.WT_Cleaning = c => rot(18, 32, 32,
    fill('M29,4h6v30h-6Z', c('ombre'))
  + fill('M22,34h20l6,22h-32Z', c('clair'))
  + fill('M23,42h18v3h-18Z', c('ombre')));

// -- dark study: an eye with a slit pupil. The first pass flattened into a
//    blob and was confused with the fish. Two fixes: the eye is less
//    stretched, and the pupil is a dark DISC split by a light slit - an
//    internal contrast, where a dark slit alone filled the whole eye.
I.WT_DarkStudy = c =>
    fill(lens(32, 32, 46, 34), c('clair'))
  + fill(circ(32, 32, 11), c('ombre'))
  + fill(vlens(32, 32, 6, 20), c('clair'));

// -- fishing: a fish. The triangular tail carries the reading on its own,
//    the eye only says which side the head is on.
I.WT_Fishing = c =>
    fill(lens(27, 32, 38, 26), c('clair'))
  + fill(poly([[44, 32], [58, 21], [58, 43]]), c('clair'))
  + fill(circ(18, 29, 3), c('ombre'));

// -- hauling: a crate and an arrow. Without the arrow, it is storage; with
//    it, it is a move.
I.WT_Hauling = c =>
    fill('M32,4l11,13h-7v7h-8v-7h-7Z', c('clair'))
  + fill('M11,28h42v26h-42Z', c('clair'))
  + fill('M11,37h42v5h-42Z', c('ombre'));

// -- hunting: a drawn bow. The first pass read as a "back" button: the arc
//    bulging left and the point on the right formed a single chevron. The
//    FLETCHING settles it - two barbs at the back give a reading direction
//    no chevron has. The bow is also slimmed down so the arrow dominates,
//    not the other way round.
I.WT_Hunting = c =>
    arc(48, 32, 26, 128, 232, 4, c('ombre'))
  + line('M32,10v44', c('ombre'), 2)
  + fill('M10,30h34v4h-34Z', c('clair'))
  + fill(poly([[40, 24], [58, 32], [40, 40]]), c('clair'))
  + fill(poly([[10, 22], [18, 30], [10, 30]]), c('clair'))
  + fill(poly([[10, 42], [18, 34], [10, 34]]), c('clair'));

// -- patient: a capsule. Receiving care is not giving it - the cross stays
//    with the doctor.
I.WT_Patient = c => rot(-35, 32, 32,
    fill('M16,24h32a10,10 0 0,1 0,20h-32a10,10 0 0,1 0,-20Z', c('clair'))
  + fill('M16,24h16v20h-16a10,10 0 0,1 0,-20Z', c('ombre')));

// -- bed rest: a bed. The headboard and legs are what separate it from a
//    plain horizontal bar.
I.WT_PatientBedRest = c =>
    fill('M6,16h6v30h-6Z', c('clair'))
  + fill('M6,30h50v10h-50Z', c('clair'))
  + fill('M14,21h14v9h-14Z', c('ombre'))
  + fill('M8,40h6v10h-6Z', c('clair'))
  + fill('M48,40h6v10h-6Z', c('clair'));

// -- plant cutting: shears. The two rings say "tool"; two crossed blades
//    alone would make a Saint Andrew's cross.
I.WT_PlantCutting = c =>
    line('M22,8L42,38', c('clair'), 6)
  + line('M42,8L22,38', c('clair'), 6)
  + cut(circ(19, 48, 9), c('ombre'), K(circ(19, 48, 4)))
  + cut(circ(45, 48, 9), c('ombre'), K(circ(45, 48, 4)));

// -- smithing: an anvil. The hammer is already taken by construction, and
//    the anvil says "metal" on its own anyway.
I.WT_Smithing = c =>
    fill('M8,22h34l10,-6v6h4v10h-8l-5,6h-14l-4,-6h-17Z', c('clair'))
  + fill('M24,38h14l9,16h-32Z', c('ombre'));

// -- tailoring: a garment. The spool and thread read as the letter "D" -
//    too many thin strokes for 20 px. The result of the work says the work
//    better than its tool, and a tunic silhouette does not resemble
//    anything else in the icon set.
I.WT_Tailoring = c =>
    fill('M24,10h16l16,9l-5,11l-7,-4v28h-24v-28l-7,4l-5,-11Z', c('clair'))
  + fill('M26,10h12l-6,7Z', c('ombre'));

// -- warden: a key. A cell's bars reduce to parallel lines, unreadable; the
//    key keeps its shape at any size.
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
  if (!I[dessin]) throw new Error(`no drawing found for work type ${n}`);
  uid = 0;
  fs.writeFileSync(`${dirWT}/${n}.svg`, head + I[dessin](mono) + '</svg>');
  uid = 0;
  fs.writeFileSync(`${dirs.sil}/WT_${n}.svg`, head + I[dessin](() => '#000') + '</svg>');
}
console.log(`${WORKTYPES.length} work type icons written`
  + ` (${Object.keys(MEME_QUE).length} reused from a skill)`);
