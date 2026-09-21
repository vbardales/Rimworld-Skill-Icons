# Backlog

Ideas for this mod that are not started. Each entry says what the feature would be, what already
covers part of it, and what has to be settled before the first line of code.

An idea earns a place here if it **serves what the mod already does**: SkillIcons draws passion
icons, so anything that makes a passion easier to recognise, choose or read belongs here. Anything
already shipped is in the changelog instead, and anything that needs checking in play is in
`docs/TESTING.md`.

---

## Change a passion's icon by clicking it in the options

Proposed 2026-09-19.

**What the feature would be.** The settings gallery already lists every installed passion, twice
each, animating live. Today it is only a display. Clicking an entry would let the player choose a
different drawing for that passion — swapping the icon without touching the def, so it survives an
update of Vanilla Skills Expanded or Alpha Skills.

**What already exists.** The gallery itself (`DrawGallery` in `SkillIconsMod.cs`), which enumerates
`DefDatabase<PassionDef>` and already resolves both variants per passion. The generator writes 41
parametric drawings to `_tools/svg/Passions/`, so the pool a player could choose from is already
larger than any one passion set uses: a VSE install shows a subset, and an Alpha Skills install a
different one, but every drawing ships.

**What has to be settled first.**

- **Where the choice lives.** A `Dictionary<string, string>` of defName to drawing name in
  `SkillIconsSettings`, scribed like the rest. Needs a rule for what happens when a stored drawing
  name no longer exists, and for a passion def that has since been removed — neither should throw,
  both should fall back silently, the way the animation lookup already falls back to the static
  icon.
- **How the choice is made.** A second window listing the available drawings is the obvious form,
  but the whole pool at 24 px is a wall of similar hearts. The 20 px silhouette rule applies here
  too: whatever the picker draws, the player has to be able to tell two entries apart at the size
  they will actually see them at.
- **Whether it replaces the hue.** Hue is identity in this set — the design rule the README opens
  with — so letting a player give two passions the same drawing breaks the one invariant the whole
  icon set is built on. Either the picker refuses a drawing already taken, or the rule is knowingly
  relaxed for anyone who opens this window. That is a design decision, not an implementation one.
- **The work tab variant.** Every passion has two icons, not one: the skill-list icon and the
  greyed work tab variant. A picker that changes only the first would leave the work tab
  disagreeing with the bio tab. The drawings are generated in both forms, so the pairing exists —
  it just has to be carried through the choice.

---

## Prove an animation actually moves, without a person watching it

Proposed 2026-09-21.

**What the gap is.** docs/TESTING.md Scenario 1 asks for four things, and three are automated:
the icons are the heart set rather than Vanilla Skills Expanded's flames, they vary with passion
state, and they appear in the Bio tab and the Work tab. The fourth — *an icon that should animate
visibly moves* — is the only one still requiring a person to look at a screen for five seconds.
It has been the last manual item on this mod since the suite was written.

**What already covers part of it.** `_tools/Run-Tests.ps1` proves the frame sets exist and that
`PassionIconAnimations.cs` and `gen.js` agree on every texture and frame count, out of game. That
proves the material for motion is shipped. It cannot prove the game draws successive frames.

**What would close it.** A step that captures the same region twice, a known number of frames
apart, and asserts the pixels differ — and, for a passion with no animation, that they do not.
That is a real assertion rather than an attached image: it fails on a still icon, which is the
defect it exists to catch. Two captures and a difference count, no video and no ffmpeg.

**What has to be settled first.**

- **Where to capture.** The settings gallery animates every passion live and needs no colony,
  which makes it the cheapest scene. The Bio tab is closer to what a player sees but needs a pawn
  with the right passion.
- **How far apart.** Too few frames and a slow animation looks static; too many and the loop may
  return to where it started. The speed slider is in the scenario's own hands, so it can be set
  high to shorten the wait, but then the test no longer runs at the documented default.
- **What "differ" means.** A strict pixel inequality is enough to catch a frozen icon, but noise
  from the map behind a transparent window would make it pass for the wrong reason. Capturing
  over the settings window, which is opaque, avoids that.
- **The negative case matters as much.** Without asserting that a still icon does *not* change,
  the test cannot distinguish "the animation runs" from "something on screen moved".

**Why it is worth doing.** This is the only check on this mod that a person has to perform by
eye, and it is the one most likely to be skipped when the suite is green everywhere else. An
animation silently stopping — a frame set renamed, a transpiler no longer matching — would
otherwise ship.
