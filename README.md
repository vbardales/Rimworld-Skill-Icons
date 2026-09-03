# SkillIcons

A unified passion icon set for Vanilla Skills Expanded and Alpha Skills, with optional subtle animations in the Bio skill list.

## Runtime behavior

Passion icons are drawn in four places. All four are covered:

| where | how |
|---|---|
| pawn creation | `SkillUI.DrawSkill` — the same method the bio tab uses |
| bio tab | `SkillUI.DrawSkill` transpiler, plus the `PassionDef.Icon` postfix |
| work tab | `WidgetsWork.DrawWorkBoxBackground` transpiler (`WorkBoxIcon`) |
| mod options | the gallery in `DoSettingsWindowContents` |

The postfix sits on the `PassionDef.Icon` getter itself, so any other caller —
Pawn Editor included — animates for free *provided it goes through that
property*. Pawn Editor is not installed here, so that one is unverified.

- If an animation sequence is absent, the static icon is used automatically.
- Under **Options > Mod settings > SkillIcons**: a checkbox that turns the whole
  set static, a speed slider, a checkbox for the "no passion" icon, the work tab
  controls below, and a gallery listing every passion def with both its
  skill-list icon and its work-tab icon, animating live at the chosen speed.

### Work tab

Vanilla Skills Expanded draws work tab passions small and desaturated, which is
where the grid becomes unreadable. Three modes:

| mode | behaviour |
|---|---|
| colour | always the full-colour icon |
| greyed | always the two-grey variant — VSE's own behaviour |
| **mixed** (default) | colour when the bonus is live, grey when dormant |

Mixed reuses what the set already means, so the grid tells you which bonuses are
actually running. "Live" is `isTriggered || learnRateFactor > 1` — the first term
catches triggered passions in their active state, the second catches permanent
bonuses like `dedicated` or `youth`, which are never "triggered" yet are real.

Size (130 % default) and opacity (85 %) are separate sliders because they solve
different problems: size helps you see the passion, opacity gives the priority
digit back to the text.

Both transpilers count their replacements and log a warning if they make none.
Without that, a failed patch is completely silent — the work tab simply keeps
VSE's icons and nothing says why. The work tab transpiler distinguishes **two**
failures, because they look identical from the game: the `WorkBoxIcon` getter not
found (wrong icons) versus the getter found but no draw call behind it (right
icons, size and opacity ignored).

The draw call is matched by shape — any `GUI.DrawTexture` overload taking exactly
`(Rect, Texture)` — not by a frozen signature, which is what broke first.

Our replacement sets `GUI.color` to **opaque white plus the configured alpha**,
never the inherited colour. At that point in `DrawWorkBoxBackground` vanilla has
left the work box's skill-level tint in `GUI.color`; since our icons are coloured
(vanilla's are white), that tint multiplies them and crushes blue and green — the
whole grid reads red. Inheriting the alpha has the matching flaw: opacity would
track skill level instead of the slider.

### The "no passion" icon

VSE gives its `None` passion `iconPath` `Things/Mote/Transparent`, so the icon is
drawn — it is simply empty. The option swaps that for a faint hollow heart at
`#4A4A4A`, served from the same `PassionDef.Icon` postfix.

**Off by default, deliberately.** Ten skills out of twelve carry it, and that
empty space is what lets you spot the passionate ones at a glance.

It is also the one place where the saturation ladder is knowingly broken: `None`
learns at `0.35` and `VSE_Apathy` at `0.25`, so the rule would make `None` the
*lighter* of the two. The icon's job here is not to compete, so it is drawn
darker anyway. Near-black was rejected for a measurable reason: on RimWorld's
`#2A2A2A` panels it disappears outright at 24 px.

## Patches

`1.6/Patches/AlphaSkills_Fixes.xml` repairs three def mistakes in Alpha Skills
(a copy-pasted description on `AS_NudistPassion_Active`, a missing "(active)" on
`AS_PainDrivenPassion_Active`, a missing `workBoxIconPath` on `AS_FrozenPassion`).
It runs inside a `<success>Always</success>` sequence, so if those defs are fixed
upstream the patch goes quietly inert instead of logging errors.

## Translations

`Languages/English` and `Languages/French`, keyed. Every string shown in the mod
settings goes through `.Translate()` — none are hardcoded in the C#.

## Load order

Load after Harmony, Vanilla Skills Expanded and Alpha Skills.

Also after Oracle's Skill Icon Retextures, if it is installed. Nothing here
depends on it, but both sets write to the same texture paths, so whichever loads
last wins — and this one is meant to.

## Credits

Every texture in this mod is drawn from scratch by `_tools/gen.js`; none is
Oracle's. But the visual language — a heart carrying one small mark that says
which passion it is — is theirs, from Skill Icon Retextures, and this set follows
it deliberately. Thanks to them.

## Design rules

Two rules govern the whole set. Both are enforced by the generator, not by hand.

**1. Hue is identity. Everything else is secondary.**

| rank | channel | carries |
|---|---|---|
| 1 | hue | *which* passion it is |
| 2 | lightness / saturation | active or dormant |
| 3 | shape | confirmation, mostly read in the Bio tab and the options gallery |
| 4 | a slight saturation lift | learning speed — suggested, never at identity's expense |

Every passion owns a hue, and they are spread right across the colour wheel:
brick red, magenta, turquoise, glacier blue, night blue, amber, coral, dark red,
dark violet, ochre, blood red, acid green, electric orange, ivory, gold, taupe,
salmon, pink, soft cyan, purple, lavender, rain blue, olive, neon teal,
blue-grey, peach.

That distribution is the single most important fix this set has had. Before it,
21 icons out of 40 were a red heart with a small coloured accessory — and at
24 px the accessory disappears, leaving a row of near-identical red blobs. **The
hue must be carried by the main mass, not by the accessory.**

Two earlier rules were wrong and are worth recording so they are not
reintroduced:

- *Speed on a four-rung saturation ladder.* It put a cliff between `1.99` and
  `2`, rendered `1.25`, `1.5` and `1.75` identically, and — because base colours
  differ in luminance — made gold look stronger than crimson at equal speed. The
  ramp is now continuous, drives saturation **and** lightness toward a common
  target, and is deliberately shallow (saturation 78 % → 100 %).
- *Steel `#8FA0B0` for dormant states.* A blue-grey belongs to the same hue
  family as `Frozen`, `Night` and `Blind`, so it read as a thematic colour
  rather than a state. Dormant is now **neutral** grey (`#8C8C8C` / `#606060`).

Family ladders keep one hue throughout and vary the fill instead: `Moody` stays
purple at all five rungs, `Psychic` stays lavender.

**2. Every icon must be recognisable as a plain black silhouette.**
Colour is a second, redundant channel. The generator writes a silhouette copy of
each icon to `_tools/silpng/`; that is the test, and it is meant to be looked at.
Its corollary: work-tab `*Grey` variants use **two** greys (`#939393` for the
main shape, `#6B6B6B` for the accessory). Flattening to a single grey destroys
the crown, the padlock and the snowflake.

## Development

`bash _tools/build.sh` regenerates everything: 34 parametric drawings in
`_tools/gen.js` become the 74 static textures, the 114 animation frames and the
74 silhouettes. Animation frame counts and modes in `gen.js` mirror the `Specs`
table in `PassionIconAnimations.cs` exactly — a count that drifts makes the DLL
fall back to the static icon.

**RimWorld loads assemblies at startup only.** Rebuilding the DLL while the game
is running changes nothing in that session, yet the mod options window — drawn by
the *loaded* DLL — still shows the new sliders, which makes a stale build look
exactly like a broken patch. The mod therefore logs
`[SkillIcons] assemblage du <date>` on load: compare it against the DLL's
timestamp before diagnosing anything.

`_tools/preview.js` composes `About/Preview.png` and `About/ModIcon.png` from the
SVGs `gen.js` just wrote, so the store images can never advertise a palette the
mod no longer ships — which is exactly what the previous hand-drawn preview did.
The grid is **sorted by hue**, 0° to 360°, because that layout demonstrates
design rule 1 instead of merely asserting it. Each icon's element ids are
prefixed per slot: every file restarts at `id="m1"`, and two same-named masks in
one document clip each other's shapes.

`_tools/audit-teintes.ps1` measures the dominant hue of every colour icon from
the rendered PNG, weighted by alpha and saturation. It checks design rule 1 on
what actually ships rather than on what `gen.js` intends — the two diverged once,
when a palette change was written but the full render pass was never re-run, and
the old red-hearted set stayed on disk.

`_tools/animation-source/Tools/Build-*.ps1` are superseded and their source paths
(`oracle-identity-svg`, `oracle-circumstantial-svg`, `oracle-remaining-svg`) no
longer exist.

`build.sh` never deletes anything under `1.6/Textures/Passions/`: that folder also
holds the seven VSE/vanilla icons, which are not part of the 74.
