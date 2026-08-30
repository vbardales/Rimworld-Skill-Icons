# Oracle's Skill Icon Retextures — extension Alpha Skills

## Ce qui a été relevé sur le mod d'Oracle (3214465250)

7 fichiers, `Textures/Passions/`, tous en **64x64 PNG, fond transparent**.

| Icône | Forme | Couleur relevée |
|---|---|---|
| PassionMajor | cœur plein | `#CC362F` |
| PassionMinor | contour de cœur épais, moitié basse remplie | `#CC362F` |
| PassionApathy | contour de cœur épais, creux | `#939393` |
| PassionCritical | flamme, avec une flamme plus petite évidée dedans | `#F79839` |
| PassionNatural | deux feuilles miroir | `#387F36` |
| `*Grey` | même silhouette, tout en gris | `#939393` |

Grammaire : **aplats purs**, une seule couleur par forme, aucun dégradé, aucun
contour, aucune ombre. Le détail est fait en **évidant** la forme (trou
transparent), jamais en ajoutant un trait par-dessus.

Cadrage : le dessin tient dans une boîte centrée de **44 x 40 px**
(x 10→53, y 12→51) sur les 64x64. Identique sur les 7 fichiers.

Contrainte dure : **RimWorld les affiche à ~24x24 px.** Deux éléments maximum
par icône, aucun détail sous 4 px.

## Ce qu'Alpha Skills demande

74 fichiers, mais seulement **34 dessins réellement distincts** :
26 familles, dont `Moody` (5 états) et `Psychic` (5 états).

Les 40 autres se déduisent mécaniquement — je les génère ici :

* les `*Grey` = la même silhouette repeinte en `#939393` ;
* les `*_Inactive` / `*_Off` = la version couleur désaturée et éclaircie ;
* les `*_Active` = la version couleur pleine (le fichier de base devient alors
  la version atténuée, pour les 6 familles concernées).

---

# Le prompt à coller dans ChatGPT

> **Important : demande du SVG, pas une génération d'image.** Un modèle
> d'image ne tiendra ni la palette exacte, ni le fond transparent, ni la
> cohérence sur 34 icônes. Le SVG donne des aplats nets, les bons hex, et je
> le convertis ici en PNG 64x64.

````
You are producing a set of 34 flat vector icons as SVG code. They extend an
existing RimWorld icon set, so consistency with that set is the single most
important criterion — more important than your own aesthetic preferences.

## The existing set you must match

Five reference icons, all drawn identically:
- a full heart, solid red;
- a heart drawn as a thick outline whose lower half is filled solid, red;
- a heart drawn as a thick outline, hollow, grey;
- a flame with a smaller flame-shaped hole cut out of its centre, orange;
- two mirrored leaves side by side, green.

Style rules, all mandatory:
- Canvas 64x64, viewBox "0 0 64 64", fully transparent background.
- Artwork stays inside a centred 44x40 box: x from 10 to 53, y from 12 to 51.
- Pure flat fills. No gradient, no stroke, no shadow, no filter, no texture,
  no outline around shapes, no 3D, no highlight.
- Detail is made by cutting transparent holes into a shape (fill-rule
  "evenodd"), never by drawing a line on top of it.
- Chunky, rounded, symmetrical silhouettes.

## Palette — use these exact values, do not invent shades

red #CC362F | orange #F79839 | green #387F36 | grey #939393
ice blue #6FBBDD | amber #E8A33D | purple #A96FC4 | lavender #B39DDB
pink #E07A9F | steel #8FA0B0 | toxic green #7CB342 | gold #E0B54A
cream #D9C9A3 | blue-grey #5F7C8A | peach #E8B48F | crimson #A3202B
grey-purple #8A7F94

## The canonical heart

Every heart in this set is the SAME shape. Use this path verbatim, only
changing the fill or cutting holes into it. Never redraw a heart freehand.

M32,52 C32,52 10,36.5 10,23 C10,16.6 14.9,12 20.6,12 C25.6,12 29.7,15 32,19
C34.3,15 38.4,12 43.4,12 C49.1,12 54,16.6 54,23 C54,36.5 32,52 32,52 Z

"Heart outline" means the same path with a smaller concentric copy cut out of
it, leaving a band about 6 px thick.
Scaling a heart: wrap it in <g transform="translate(...) scale(...)"> so the
result stays centred in the 44x40 box.

The flame is your own shape: a teardrop, wide and round at the bottom, drawn
up to a tip that leans and curls slightly, with a smaller flame-shaped hole
cut out of its lower centre. Draw it once, reuse it identically.

## Hard constraints

- Displayed in game at 24x24. No feature thinner than 4 px at 64 px scale.
  At most 2 elements per icon. No text, no faces, no fine linework.
- Output ONLY: <path>, <circle>, <ellipse>, <rect>, <polygon>, <g transform>.
  No <style>, no CSS classes, no <defs>, no <use>, no gradients, no filters,
  no external references, no comments inside the SVG.
- Each file: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"
  width="64" height="64"> ... </svg>

## Output format

One fenced code block per icon, each preceded by a line of the form:
### AS_XxxPassion.svg
Produce 8 icons per message, then stop and wait for me to say "next".

## The 34 icons

1.  AS_DedicatedPassion — the heart in red, with its top-right lobe cut away
    (a clean quarter removed: straight cut up from the centre, straight cut
    right from the centre). Reads as a three-quarter heart.
2.  AS_ObsessivePassion — the flame shape, scaled to about 75% and centred,
    filled red instead of orange.
3.  AS_SynergisticPassion — a red heart scaled to 80%, with two thick open
    arcs on each side radiating outward like ripples, red, 5 px thick.
4.  AS_FrozenPassion — the heart in ice blue, with a snowflake cut out of its
    centre: three crossing bars at 0, 60 and 120 degrees, 5 px thick, 26 px
    long. Nothing else.
5.  AS_NightPassion — a red heart shifted 4 px left, with an ice blue crescent
    moon behind its right side, horns pointing right, 8 px thick.
6.  AS_DrunkenPassion — a red heart, with three amber circles (radius 5, 4, 3)
    rising diagonally off its top-right corner.
7.  AS_YouthPassion — a large red heart outline, with a small solid red heart
    (about 40% scale) centred inside it.
8.  AS_VengefulPassion — a red heart split by a jagged transparent crack
    running from the top notch down to the bottom point, 5 px wide, three
    zigzags.
9.  AS_ForbiddenPassion — a red heart with a keyhole cut out of its centre:
    a circle of radius 6 sitting on a downward-widening trapezoid, 6 px wide
    at the top, 10 px tall.
10. AS_NomadicPassion — a red heart scaled to 80% and shifted down-left, with
    a cream four-pointed star (concave diamond, 18 px across) at its upper
    right.
11. AS_SanguinePassion — a red heart with a single crimson teardrop hanging
    below its bottom point, 12 px tall, touching the tip.
12. AS_ToxicPassion — the heart in toxic green, with three round holes cut out
    of its lower half (radius 5, 4, 3), like bubbles.
13. AS_PainDrivenPassion — a red heart with three parallel diagonal claw
    slashes cut through it, each 5 px wide, running upper-left to lower-right.
14. AS_BlindPassion — a red heart with a closed eye cut out of its centre: a
    horizontal almond shape, 26 px wide, 8 px tall, pointed at both ends.
15. AS_CompetitivePassion — a red heart scaled to 85% and shifted down, with a
    gold crown resting on top of it: a band with three triangular points,
    22 px wide, 12 px tall.
16. AS_DuncePassion — a red heart with a grey cone (dunce cap) tilted about 15
    degrees, sitting on its top-left lobe, 14 px wide at the base, 18 px tall.
17. AS_IdeologicalPassion — a red heart scaled to 75%, surrounded by eight gold
    triangular rays forming a sunburst halo, each 6 px wide at the base and
    8 px long, not touching the heart.
18. AS_IntimatePassion — two pink hearts at about 65% scale, overlapping side
    by side, the left one 4 px higher than the right one.
19. AS_LikeMindedPassion — one red heart at 65% in the centre, flanked left and
    right by two grey hearts at 45%, all sitting on the same baseline.
20. AS_MoodyPassion_Apathy — hollow heart outline, grey-purple.
21. AS_MoodyPassion_NoPassion — hollow heart outline, purple.
22. AS_MoodyPassion — heart outline with the lower half filled solid, purple.
23. AS_MoodyPassion_Major — full solid heart, purple.
24. AS_MoodyPassion_Greater — the flame shape, purple.
25. AS_PsychicPassion_Nullified — hollow heart outline, grey.
26. AS_PsychicPassion_Minor — heart outline with the lower half filled solid,
    lavender.
27. AS_PsychicPassion — full solid heart, lavender.
28. AS_PsychicPassion_Major — full solid heart in lavender, scaled to 80%, with
    one open arc on each side, 4 px thick, like a psychic wave.
29. AS_PsychicPassion_Critical — the flame shape, lavender.
30. AS_RainyDayPassion — a red heart scaled to 85% and shifted up-left, with
    three ice blue teardrops falling below its right side, 8, 7 and 6 px tall.
31. AS_StonedPassion — a red heart scaled to 85% and shifted up-left, with one
    green leaf (same leaf shape as the reference set) tucked at its lower
    right, tilted 30 degrees.
32. AS_NudistPassion — the heart in peach. Nothing else.
33. AS_TranshumanistPassion — the heart split vertically down the middle: left
    half red, right half steel, with three square notches cut into the steel
    half's outer edge like gear teeth.
34. AS_TraumaticPassion — the heart in blue-grey, with a cream bandage laid
    diagonally across its centre: a rounded rectangle 30 px long, 10 px wide,
    rotated 30 degrees.
````

---

## Les choix de dessin, et d'où ils viennent

Les propositions des commentaires Steam que tu m'as passées couvrent 13 passions.
Je les ai suivies quand elles étaient nettes, arbitré quand les deux
commentateurs divergeaient, et tranché seul pour les 13 autres passions
qu'Alpha Skills ajoute mais que personne n'avait traitées.

| Passion | Retenu | Pourquoi |
|---|---|---|
| dedicated | cœur aux trois quarts | proposé par les deux, et comble le trou entre minor (moitié) et major (plein) |
| obsessive | flamme rouge | « a small, red version of the critical icon », littéral |
| synergistic | cœur + ondes | « rippling minor heart » ; les ondes sont déjà l'iconographie d'Alpha Skills pour cette passion |
| frozen | flocon évidé dans un cœur bleu glace | les deux disaient flocon ; l'évider garde la famille cœur |
| night | cœur + croissant bleu | consensus des deux |
| drunken | cœur + bulles ambre | plutôt que la chope : à 24 px, deux objets détaillés côte à côte se brouillent |
| youth | petit cœur dans un grand contour | proposé, et parle mieux que la tétine ou l'école |
| vengeful | cœur fendu | la face de démon cornue passe mal en aplat monochrome |
| forbidden | cœur + trou de serrure | proposé, et se distingue de major sans changer de couleur |
| nomadic | cœur + étoile à quatre branches | l'avion est hors ton pour RimWorld ; la roue devient illisible à 24 px |
| sanguine | cœur + goutte | les deux l'acceptaient ; les crocs demandent trop de finesse |
| toxic | cœur vert toxique + bulles | le crâne évidé passe mal sous 24 px, la couleur suffit à signer |
| pain-driven | cœur + trois griffures | « claw marks », et ça reste distinct de la fêlure de vengeful |
| blind | cœur + œil clos évidé | *(non traité dans les commentaires)* |
| competitive | cœur + couronne dorée | *(idem)* — « être le meilleur » |
| dunce | cœur + bonnet d'âne gris | *(idem)* |
| ideological | cœur + auréole de rayons dorés | *(idem)* |
| intimate | deux cœurs roses enlacés | *(idem)* |
| like-minded | un cœur rouge entre deux cœurs gris | *(idem)* — distinct d'intimate |
| moody | l'échelle vanilla entière en violet | *(idem)* — 5 états, la couleur porte le sens |
| psychic | l'échelle vanilla entière en lavande | *(idem)* — 5 états |
| rainy day | cœur + gouttes de pluie | *(idem)* |
| stoned | cœur + feuille verte | *(idem)* — réemploie la feuille de « natural » |
| nudist | cœur pêche, nu | *(idem)* |
| transhumanist | cœur mi-rouge mi-acier denté | *(idem)* |
| traumatic | cœur bleu-gris + pansement | *(idem)* |

---

## Après

Colle-moi les 34 blocs SVG (par paquets, peu importe l'ordre). Je m'occupe de :

1. la conversion en PNG 64x64 transparent (Chrome headless, chaîne déjà testée
   contre le cœur d'Oracle : superposition quasi parfaite) ;
2. les 26 variantes `*Grey` et les 14 variantes `*_Inactive` / `*_Off` /
   `*_Active` ;
3. le montage du mod : `About.xml`, `loadFolders.xml`, et `Textures/Passions/`
   aux 74 noms exacts qu'Alpha Skills réclame, avec `loadAfter` sur
   `sarg.alphaskills`.

Aucune DLL ni aucun def n'est nécessaire : RimWorld sert la texture du dernier
mod chargé pour un chemin donné.
