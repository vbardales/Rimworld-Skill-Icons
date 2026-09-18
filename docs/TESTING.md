# Testing

What has actually been observed, what has not, and how to observe the rest.

## The one thing to understand first

**Every failure mode here is silent by design, not by accident.** If a Harmony transpiler finds
nothing to patch, the mod does not crash and does not disable itself - the work tab or the bio
tab simply keeps drawing Vanilla Skills Expanded's own icons, and nothing in the game's own UI
says why. The two transpilers and the `DoHeader` prefix each log a warning when they patch zero
call sites, specifically so a broken patch is *findable* instead of just quietly reverting to
vanilla. A clean `Player.log` proves the load did not throw; it does not prove every icon you see
is animated or colour-coded the way the mod intends. Positive, on-screen evidence is what the
scenarios below ask for.

The log lives at:

```
%USERPROFILE%\AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\Player.log
```

## Status

| | State |
|---|---|
| Loads without error (Scenario 0) | **observed, 2026-09-17** - see below |
| The out-of-game harness | **29 of 29 pass**, 2026-09-17 |
| Scenarios 1-11 | **never observed** |

## The other half, which does not need a colony

`_tools/Run-Tests.ps1` runs twenty-nine tests without starting the game:

```powershell
powershell -ExecutionPolicy Bypass -File _tools\Run-Tests.ps1
```

It asks a different question from the one this file asks: whether the settings clamps, the
Harmony patch targets, the MainButtons wiring, the skill/work-type badge mapping, the animation
frame table and the two Alpha Skills/VSE patch files still do what the mod claims, checked
against the compiled DLL and the real installed dependency mods - not whether a colonist ever
sees the result on screen. Two things it found worth recording while it was being written:

- `Verse.PatchOperationSequence` is a **chain**, not five independent fixes: it stops at the
  first sub-operation whose xpath matches nothing at all. `AlphaSkills_Fixes.xml`'s five fixes
  therefore share a single point of failure - if Alpha Skills ever drops or renames
  `AS_NudistPassion_Active` while the other four bugs remain, none of the other four fixes
  apply either, even though each is logically independent. `<success>Always</success>` only
  promises the log stays clean; it does not promise every fix still lands.
- The two Alpha Skills def fixes were checked against the real, currently-installed defs, not a
  hand-typed copy of them: `AS_NudistPassion_Active`'s description genuinely is the
  `AS_NomadicPassion` text, copy-pasted, and `AS_PainDrivenPassion_Active`'s label genuinely is
  still `"pain-driven"`, both confirmed on disk before the patch runs.

Neither half replaces the other. Nothing there sees a heart-shaped icon animate in the bio tab.

## Scenario 0 — it loaded

**Do:** start a game with the mod active, Harmony, Vanilla Skills Expanded and Alpha Skills all
present.

**Expect:** one line naming the loaded assembly's build date:

```
[SkillIcons] assembly dated <yyyy-MM-dd HH:mm:ss>
```

Compare that date/time against the actual file time of `Mod/1.6/Assemblies/SkillIcons.dll` -
they must match. A mismatch means the loaded DLL is not the one on disk, and every scenario
below is describing a build that is not actually running.

**Then filter the log for the classics, and for this mod's own warnings:**

```
Select-String -Path "$env:USERPROFILE\AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\Player.log" -Pattern '^(XML error|Config error|Could not resolve|Could not find)|^\[SkillIcons\]'
```

**Fails if:** the assembly-date line is missing, or any of these three appear (each names the
exact transpiler/prefix that found nothing to patch, and the interface area it leaves showing
Vanilla Skills Expanded's own icons instead):

```
[SkillIcons] No call to PassionDef.WorkBoxIcon found in DrawWorkBoxBackground: the Work tab icons will stay Vanilla Skills Expanded's own. Check that SkillIcons is loaded after it.
[SkillIcons] WorkBoxIcon hijacked N times, but no recognised draw call followed: the Work tab icons will be ours, without the size or opacity settings.
[SkillIcons] No call to PassionDef.Icon found in SkillUI.DrawSkill: the skill list and pawn creation screen will keep Vanilla Skills Expanded's own icons.
[SkillIcons] DoHeader not found: Work tab column headers will stay without an icon.
```

**Observed, 2026-09-17.** Read directly from `Player.log` after the session that also ran the
Pickle suite (see `STATUS.md`, "In-game Pickle run"): the assembly-date line reads
`[SkillIcons] assembly dated 2026-09-17 14:36:21`, matching `Mod/1.6/Assemblies/SkillIcons.dll`'s
own file time on disk to the second. None of the three failure warnings appear anywhere in the
log, and no `XML error`/`Config error`/`Could not resolve`/`Could not find` line mentions
SkillIcons. Passed.

## Scenario 1 — passion icons appear in all four places

**Preconditions:** scenario 0 passed. A colonist with at least one passion in each state (none,
dormant, live/triggered) - the pawn creation screen or `Dev: Regenerate id` a few times usually
gets a mixed set quickly.

**Do:** open the pawn creation screen, then a colonist's Bio tab, then the Work tab.

**Expect:** the same heart-shaped icon set (not the vanilla flame/star icons) in all three
places, colour-coded by hue per passion, with the live ones noticeably brighter than the dormant
ones. Passions with an animation sequence (most of the forty) visibly move - the padlock opens
and closes, the bubbles rise in the champagne glass, the mood icon drifts along its scale.

**Fails if:** any of the three places still shows Vanilla Skills Expanded's own flame/star icons,
or an icon that should animate never moves.

**Not yet observed on the three named places (vanilla pawn creation screen, Bio tab, Work tab) -
her modlist replaces at least two of them and she is still locating an unmodified route to each.**
Third-party skill/work UI observed in the meantime, 2026-09-18, recorded here as extra evidence
rather than a verdict on this scenario:

- **Character Editor** (skill list): coloured heart icons present, correctly varied by passion
  state, **confirmed animating**.
- **Modern Bio** (skill list): coloured heart icons present, **static, does not animate**. Expected
  by design: the icon itself likely comes from a patched `PassionDef.Icon` getter, reached from
  anywhere, while the animation is injected by a Harmony transpiler targeting the specific IL of
  `RimWorld.SkillUI.DrawSkill`/`WidgetsWork.DrawWorkBoxBackground` - a replacement UI mod drawing
  its own list gets the right icon but not the transpiled animation, unless it happens to call the
  same vanilla method internally. Not a defect: Modern Bio is not a mod SkillIcons targets.
- **A third-party Work tab replacement** (priority grid with text-only diagonal column headers):
  **no SkillIcons icon at all**, anywhere in the grid or headers. Same reasoning: this mod draws
  its own grid, never calling `WidgetsWork.DrawWorkBoxBackground` or the `DoHeader` prefix. Whether
  the vanilla Work tab is still reachable on this modlist, for Scenarios 1/3/4/6/7, is unconfirmed.

## Scenario 2 — the settings page opens from the primary entry and matches its documented defaults

**Do:** Options > Mod settings > SkillIcons, on a clean configuration (no prior `Mod_SkillIcons_*`
settings file, or one deleted first).

**Expect:** animated passion icons checked; speed slider at 1.0x; the "no passion" icon
unchecked; work tab mode set to **Mixed**; work tab icon size at 130%, opacity at 85%; skill
icons and work type icons both checked; "borrow Pawn Badge icons" checked; column headers set to
icon-and-label. A live gallery below the controls lists every installed passion, twice each
(skill-list icon, work-tab icon), animating at the chosen speed.

**Fails if:** any default differs from the list above (the out-of-game harness proves the
`ExposeData` clamps and defaults in isolation; this proves the same values reach the actual
window).

## Scenario 3 — the three work tab modes actually change what is drawn

**Preconditions:** a colonist with at least one live and one dormant passion, Work tab open in a
second window or quickly reopened after each change.

**Do:** in the settings, switch the work tab mode through **Colour**, **Greyed**, then back to
**Mixed**.

**Expect:** in Colour, every passion icon in the Work tab is full-colour regardless of state. In
Greyed, every icon uses the two-grey variant, matching Vanilla Skills Expanded's own prior
behaviour. In Mixed, only the live passion is full-colour; the dormant one is grey.

**Fails if:** any mode fails to change what is drawn, or Mixed does not distinguish live from
dormant.

## Scenario 4 — work tab size and opacity sliders have a visible, reversible effect

**Do:** with a colonist's Work tab open, drag the icon size slider to its minimum then maximum,
and the opacity slider to its minimum then maximum, returning each to its default afterward.

**Expect:** the icon visibly grows/shrinks with the size slider; the icon fades toward
transparent and back with the opacity slider, and the priority digit underneath becomes easier to
read as opacity drops. Both revert cleanly to the 130%/85% defaults.

**Fails if:** either slider has no visible effect, or the values do not survive being set back to
their defaults (compare against Scenario 2 after reverting).

## Scenario 5 — the "no passion" icon is off by default and, when enabled, is not more prominent than a real passion

**Do:** find a skill with no passion at all. Confirm nothing is drawn there by default. Enable
"show an icon for no passion" in the settings, reopen the Bio tab.

**Expect:** by default, empty space, matching vanilla. Enabled, a faint hollow heart outline
appears, visibly dimmer/less prominent than any real passion's icon on the same pawn.

**Fails if:** the icon is visible before the option is enabled, or is as bright as (or brighter
than) an active passion once enabled.

## Scenario 6 — skill and work type icons, and the Pawn Badge borrow toggle

**Preconditions:** for the borrow half, install *Pawn Badge - (MISC) Job Icons+ Revitalized* for
one run and remove it (or disable it) for a second run.

**Do:** open the Bio tab and the Work tab with both "icons in the skill list" and "icons on work
tab columns" checked, then unchecked. With Pawn Badge installed, toggle "borrow Pawn Badge icons
when available" on and off.

**Expect:** unchecking either checkbox removes exactly that set of icons (skill list icons, or
work tab column-header icons) and nothing else. With Pawn Badge installed and the borrow option
on, the columns Pawn Badge covers show its icons instead of this mod's own; Basic Work, Childcare,
Dark Study and Patient always keep this mod's own drawings, borrow option or not. Removing Pawn
Badge (or unchecking the option) falls back to this mod's own icons everywhere, with no gap.

**Fails if:** a checkbox does not toggle its icons, the four uncovered work types ever show a
gap instead of this mod's drawing, or Pawn Badge icons persist after that mod is removed.

## Scenario 7 — work tab column header modes

**Do:** in the settings, switch "column headers" through **icon and label**, **icon only**, and
**label only**.

**Expect:** icon-and-label shows both; icon-only narrows the column and shows just the icon, with
a tooltip on hover naming the work type and its description (the label the column would
otherwise have shown); label-only shows text exactly as Vanilla Skills Expanded already did.

**Fails if:** icon-only loses the tooltip, or any mode fails to change the header's appearance.

## Scenario 8 — settings persist across reopen, restart, and a reloaded save

**Do:** change several settings (work tab mode, speed, one checkbox), close and reopen the
settings window, then fully restart RimWorld, then load an existing save from before the
settings change.

**Expect:** the changed values survive reopening the window and restarting the game (mod
settings are global, not per-save) - including after loading an older save, since these are not
scribed into the save file.

**Fails if:** any value reverts on reopen or restart.

## Scenario 9 — the hidden MainButtons shortcut

**Preconditions:** RIMMSQOL (or another MainButtons-customization mod) installed and active.

**Do:** on a clean configuration, check the MainButtons bar for a SkillIcons entry - expect none,
neither visible nor greyed out. In RIMMSQOL, reveal the `SkillIcons_Settings` button, click it,
change a setting, close it, then open the primary Options > Mod settings > SkillIcons entry.

**Expect:** no visible or greyed-out button before it is revealed. Once revealed and clicked, it
opens the identical settings window - same controls, same current values - as the primary entry;
a change made through one is visible through the other, since both open the same
`Dialog_ModSettings` for the same loaded mod instance. Hiding the button again in RIMMSQOL
persists across a restart.

**Fails if:** the button is visible or greyed out before being revealed, opens a different or
reduced set of controls, or a change made via one entry point is not visible via the other (the
out-of-game harness proves the IL calls `LoadedModManager.GetMod<SkillIconsMod>()` and
`Dialog_ModSettings`'s constructor; this proves the two entry points actually agree on screen).

## Scenario 10 — English and French

**Do:** with the game language set to French, repeat Scenario 2 (open the settings) and Scenario
9 (the MainButtons shortcut's label/description/tooltip). Switch back to English and repeat.

**Expect:** every control label, tooltip and the MainButtons entry's own label/description are
translated in French, with no raw translation key, no untranslated placeholder, and no text
clipped or overflowing its control at either 100% and a larger UI scale.

**Fails if:** a raw key (e.g. `SkillIcons.Speed`) is ever visible, a control is empty, or text is
clipped.

## Scenario 11 — the Alpha Skills and Vanilla Skills Expanded def fixes are visible in the tooltip

**Preconditions:** a colonist with the "nudist (active)", "pain-driven (active)", "frozen",
"blind, sublime" (either tier) or "apathy" passion state, or `Dev` tools to force one.

**Do:** hover the passion icon in the Bio tab or Work tab for each of the five states above.

**Expect:** nudist (active)'s tooltip describes nudity, not caravans or expeditions;
pain-driven (active)'s label reads exactly "pain-driven (active)", distinguishable from the
dormant "pain-driven"; frozen shows a Work tab icon instead of an empty cell; the two blindness
tiers show visibly different icons (the sublime tier's iris a different colour from the elevated
tier's); apathy shows a Work tab icon instead of an empty cell.

**Fails if:** any of the five still shows the pre-patch text or the empty Work tab cell (the
out-of-game harness proves the patch XML changes these fields against the real installed defs;
this proves the corrected values are what the player actually sees in the tooltip, post-loading
and post-translation).
