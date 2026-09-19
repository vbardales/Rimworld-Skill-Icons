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
