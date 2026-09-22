# Testing

What has actually been observed, what has not, and how to observe the rest.

## The one thing to understand first

**Every failure mode here is silent by design, not by accident.** If a Harmony transpiler finds
nothing to patch, the mod does not crash and does not disable itself - the work tab or the bio
tab simply keeps drawing Vanilla Skills Expanded's own icons, and nothing in the game's own UI
says why. Both transpilers log a warning when they patch zero
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
| The out-of-game harness | **25 of 25 pass**, 2026-09-19 |
| Scenario 1 (icons in three places) | **passed** on the Work tab and pawn creation screen, Bio tab confirmed 2026-09-19 |
| Scenario 2 (settings defaults) | **passed**, 2026-09-19 |
| Scenario 3 (three work tab modes) | **passed**, 2026-09-20, after the defect it exposed was fixed |
| Scenario 4 (size/opacity sliders) | **passed**, 2026-09-19 |
| Scenario 5 (the "no passion" icon) | **passed**, 2026-09-20 |
| Scenario 9 / Feature 17 (the MainButtons shortcut) | Mod-owned path **passed**, 2026-09-20; dedicated RIMMSQOL pass **4/4 passed**, 2026-09-22, with all four captures reviewed including 150% scale |
| Scenario 11 (the def fixes) | **passed**, 2026-09-20, asserted against the loaded DefDatabase. Down to two, as of 2026-09-22: Sarg Bjornson fixed three of the original four Alpha Skills findings upstream, see below |
| Scenario 8 (persistence) | in-process round trip **passed**; the strengthened real restart **passed**, 2026-09-22, writer 1/1 then existing-save reader 1/1 in distinct processes under one ticket |
| Scenario 10 (English and French) | **passed in both passes**, 2026-09-21, once it stopped switching language mid-run |
| Scenarios 6, 7 | removed with the feature they tested, 2026-09-19 |

## How many passes, and which

**Eight acceptance tickets, plus the separate publication studio pass.** A mod whose TESTING.md
does not name its required mod sets and process boundaries has been tried, not tested. The
acceptance set is minimal/no optional, Oracle, RIMMSQOL, the two-process restart chain, and one
three-feature ticket for each of Better, Compact, Enhanced and Krypt Work Tab.

**Completed 2026-09-22:** RIMMSQOL 4/4; restart writer 1/1 then reader 1/1; Better, Compact,
Enhanced and Krypt each 3/3. All required reports were complete with no skips, and every review
capture was opened: four for RIMMSQOL and nine for each replacement Work Tab. The studio pass also
passed 2/2 and its two final publication images were reviewed separately.

**Measured 2026-09-21, and the first time this pass has run:** `15` and `16` with Oracle staged, 2 scenarios,
2 passed, `exitReason: passed`. `16` passing is the evidence that matters - it asserts two mods really
ship the same paths, so Oracle was mounted and the contest was real - and `15` passing means this
mod won it. A green there is therefore worth reading, which it would not have been without `16`.

    scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepMap wsl-deps.sans-facultatifs.map # sans-facultatifs
    scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepMap wsl-deps.avec-oracle.map \
        -Filter '15-texture-ownership.feature,16-texture-contest.feature'        # avec-oracle

The pass name is written into the report, so a green is attributable to a mod set rather than to
"a run".

**`sans-facultatifs`** mounts Core, the DLCs, Harmony, RimLogging, Pickle, the hard dependencies
(Vanilla Skills Expanded and Alpha Skills), this mod, and only the development-time InspectTabs
and TextureOwner vocabularies from PickleTools. It adds no optional gameplay mod. It proves the
mod stands on its own; the explicit map is required now that reusable steps no longer live in the
suite's own DLL.

**`avec-oracle`** adds Oracle's Skill Icon Retextures, and it is not a formality. Oracle's set and
this one write to the **same texture paths**, so whichever loads last wins - which is the entire
reason `About.xml` names it in `<loadAfter>`. In the minimal pass the icon scenarios prove this
mod's textures load; in this one they prove the `loadAfter` actually wins. **Nothing else covers
that.** `_tools/Run-Tests.ps1` reads this mod's own files and cannot see a second mod overwriting
a path at load, so if the ordering silently broke, every scenario in this suite would stay green
while every player who has Oracle installed saw Oracle's icons instead of these.

Oracle is not in her active mod list; the staging takes it from the Workshop folder, where it is
present. `Tests/Pickle/wsl-deps.avec-oracle.map` names it.

The two features that pass carries are what make it worth running. `15-texture-ownership.feature`
asserts WHICH mod answers for each of the eleven texture paths the two sets share - not pixels,
which would only ever say "different", but RimWorld's own content holders, the ones ContentFinder
searches. `16-texture-contest.feature` asserts that the contest is real: an uncontested path in
that pass means Oracle is not actually staged, and 15 would then pass for the wrong reason. It is
a separate file, named in the pass that wants it. A tag can SELECT what a launch runs, but I found
no way to make one EXCLUDE a scenario from a plain run, and a scenario that must not run in the
minimal pass has to be kept out of it by something more certain than a tag I have not seen work.

**Known consequence, not yet resolved: a plain run of the whole suite is red.** `16` fails without
Oracle staged, by design, and `13` refuses to pass when `12` ran in the same process, also by
design - a restart test that never restarted proves nothing. Until those three live in a companion
suite that a plain launch does not select, the pass names above are the only correct way to run
them, and the plain pass should be read with those three scenarios set aside.

No optional of this mod is incompatible with another. The four Work-tab passes are an explicit
compatibility matrix because each replacement owns a different visible Work interface; they are
not a combinatorial fan-out.

**`11-publication-shots.feature` belongs to the studio pass only**. Run it with
`wsl-deps.studio.map`, which stages PickleTools' ScreenshotStudio, ClearScreen, InspectTabs and
ScreenshotMode companions and loads `nelim-zen-meadow-studio`; functional scenarios keep their
existing fixtures and maps.
Any third-party skill or work interface may redraw what it photographs - Bio Tab+ draws its own
character card and never reaches this mod's transpiler; a third-party Work tab replacement shows
none of these icons - so a capture taken with those loaded would advertise someone else's
interface on this mod's store page.

## The other half, which does not need a colony

`_tools/Run-Tests.ps1` runs twenty-five tests without starting the game:

```powershell
powershell -ExecutionPolicy Bypass -File _tools\Run-Tests.ps1
```

It asks a different question from the one this file asks: whether the settings clamps, the
Harmony patch targets, the MainButtons wiring, the animation
frame table and the two Alpha Skills/VSE patch files still do what the mod claims, checked
against the compiled DLL and the real installed dependency mods - not whether a colonist ever
sees the result on screen. Two things it found worth recording while it was being written:

- `Verse.PatchOperationSequence` is a **chain**: it stops at the first sub-operation whose xpath
  matches nothing at all. `AlphaSkills_Fixes.xml` held its five fixes in one, so they shared a
  single point of failure - if Alpha Skills ever dropped or renamed `AS_NudistPassion_Active`
  while the other four bugs remained, none of the other four fixes would apply either, and
  `<success>Always</success>` would keep the log clean about it. **Split into five independent
  top-level operations on 2026-09-21**, each carrying its own `<success>Always</success>`, and the
  harness test that used to assert the damage now asserts its absence.
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

**The animation is automated as of 2026-09-21** (`14-animation-runs.feature`), and no longer needs
watching. It asks `PassionDef.Icon` - the call site the game itself draws from, so a transpiler
that stopped applying fails here too - what texture a passion shows, twice, thirty frames apart.
`AS_DrunkenPassion_Active` and `VSE_Apathy` must answer differently; `AS_BlindPassion_Elevated`
and `AS_NudistPassion`, which have no animation, must answer identically. That second scenario is
what gives the first its meaning: "the texture changed" alone does not distinguish an animation
running from anything else changing. Both green on first run.

**Pawn creation screen: observed, 2026-09-18.** Her own screenshot of `Page_ConfigureStartingPawns`
shows coloured heart icons per skill, correctly varying with value (hollow/pale at 0, filled and
differently coloured above it) - matches expectation, not the vanilla flame/star set.

**Work tab: observed and confirmed, 2026-09-18.** Zoomed into the new Pickle suite's own
`manual--work-tab-mixed-passions--step0.png`: real dark-red heart icons appear in the
"Passionate" colonist's row, mixed with plain green checkmarks elsewhere. The "Priorité
manuelle ❌" header confirms this is the **real vanilla `MainTabWindow_Work`** in its
checkbox-priority mode, not the third-party Work tab replacement observed earlier - `I open the
"Work" tab"` reaches the real class directly regardless of what her own interface currently has
bound. This resolves the `Tests/Pickle/README.md` "real uncertainty" note. She then confirmed the
same directly, live, on her own game (a full-width screenshot of the same "Priorité manuelle ❌"
window across three colonists, coloured hearts clearly varied - red, orange/gold - across
different skills), and separately confirmed **the icons animate in this vanilla window**. Fails-if
conditions for the Work tab: not met. Passed.

**Bio tab: observed, 2026-09-19.** The `I close all dialogs` fix landed: the rerun's
`manual--bio-tab-mixed-passions--step0.png` shows the character card unobstructed, and the mix the
custom step set is exactly what is drawn - Shooting cleared and iconless, Mining a hollow heart
(Minor), Cooking and Plants filled red hearts (Major, and the granted `VSE_Natural`), Melee a
distinct pink spiral. Heart set, not vanilla flame/star, varying with state. Passed. Cropped to
`Screenshots/04-bio-tab-skills.png`.
Third-party skill/work UI observed in the meantime, 2026-09-18, recorded here as extra evidence
rather than a verdict on this scenario:

- **Character Editor** (skill list): coloured heart icons present, correctly varied by passion
  state, **confirmed animating**.
- **Bio Tab+** (character card, `Axolki.BioTabPlus`): coloured heart icons present, **static, does
  not animate**. **Correction, same day:** first recorded here under the name "Modern Bio" - she
  does not have that mod installed at all; it was Bio Tab+ both times, one screenshot mislabeled.
  Expected by design, not a defect: `[Bio Tab+] Character card patches applied.` in `Player.log`
  confirms it draws its own card rather than calling `RimWorld.SkillUI.DrawSkill`. The icon itself
  likely comes from a patched `PassionDef.Icon` getter, reached from anywhere; the animation is
  injected by a Harmony transpiler targeting that specific method's IL, which a mod drawing its own
  card never reaches. No compatibility patch is warranted for this alone: the icon (shape, colour,
  passion state) is already correct, only the animation flourish is missing, and a per-UI-mod patch
  would not scale to every skill-list replacement out there. Considered and declined 2026-09-18.
- **A third-party Work tab replacement** (priority grid with text-only diagonal column headers):
  **no SkillIcons icon at all**, anywhere in the grid or headers. Same reasoning: this mod draws
  its own grid, never calling `WidgetsWork.DrawWorkBoxBackground` or the `DoHeader` prefix. Whether
  the vanilla Work tab is still reachable on this modlist, for Scenarios 1/3/4/6/7, is unconfirmed.

## Scenario 2 — the settings page opens from the primary entry and matches its documented defaults

**Do:** Options > Mod settings > Skill Icons, on a clean configuration (no prior `Mod_SkillIcons_*`
settings file, or one deleted first).

**Expect:** animated passion icons checked; speed slider at 1.0x; the "no passion" icon
unchecked; work tab mode set to **Mixed**; work tab icon size at 130%, opacity at 85%. A live gallery below the controls lists every installed passion, twice each
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

**Failed 2026-09-19, fixed, and confirmed fixed 2026-09-20 - see the confirmation at the end of this scenario.** The Pickle
suite's three captures (`work-tab-mode-colour|grey|mixed`) are the same image. Measured, not
eyeballed: over the priority grid the three differ by 0.2-0.5% of bytes, which is animation-frame
noise, and the discriminating counts are flat - 5045 / 5027 / 5060 red pixels and 0.3208 / 0.3201 /
0.3191 mean saturation. If Greyed desaturated anything the red count would collapse. At 6x zoom the
same hearts sit in the same cells in all three.

Not a harness artifact: the steps write the live static `SkillIconsMod.Settings` the drawing code
reads, and Scenario 4's sliders, which act on the same cells through the same patched path, changed
the drawing dramatically in the same run. The mode alone did nothing.

Cause, in `PassionIconAnimations.cs`: `WorkBoxAnimatedIcon` picked the right texture per mode -
`Icon` in colour, `WorkBoxIcon` in grey - then handed it to `AnimatedIconOrFallback`, which ignores
the texture it is given whenever the passion has an animation and returns a frame instead. Every
frame is drawn in colour; there is no grey frame set. So for the forty animated passions all three
modes drew the same coloured frame, and the fallback carrying the mode was discarded. Fixed by
giving that helper an `animate` flag and passing `false` on the grey path, so an asleep bonus draws
its static grey icon and does not animate.


**Confirmed fixed, 2026-09-20.** The trio was re-shot on the run that followed the fix, and
measured the same way as the failure, so the two numbers are comparable. Before: 5045 / 5027 /
5060 red pixels and 0.3208 / 0.3201 / 0.3191 mean saturation across the priority grid - flat.
After: **5027 / 4532 / 4735** and **0.3208 / 0.2990 / 0.3083** - an ordering in the expected
direction, colour above mixed above grey.

The zoom settles it beyond the numbers. In colour every heart is red; in greyed every heart is
grey, without exception; in mixed the live passion is red and the dormant ones are grey. That last
one is the part the numbers alone could not show, and it is the behaviour the mode exists for.

Why grey still reads ~4500 red pixels rather than none: the region measured includes the work
tab's own red priority-box borders and cell backgrounds, which are not passion icons and never
change with the mode.

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


> **Scenarios 6 and 7 were removed on 2026-09-19**, with the feature they tested. The skill and
> work type icon set — the twelve skill icons, the twenty-three work type icons, their two
> toggles and the three column-header modes — moved to Work Studio, which owns work types and
> was already designing a per-type icon in its own backlog. SkillIcons draws passions only. The
> numbering is left with a gap on purpose: this file, `STATUS.md` and several commit messages all
> cite scenarios by number, and renumbering would silently invalidate every one of those citations.

## Scenario 8 — settings persist across reopen, restart, and a reloaded save

**Do:** change several settings (work tab mode, speed, one checkbox), close and reopen the
settings window, then fully restart RimWorld, then load an existing save from before the
settings change.

**Expect:** the changed values survive reopening the window and restarting the game (mod
settings are global, not per-save) - including after loading an older save, since these are not
scribed into the save file.

**Fails if:** any value reverts on reopen or restart.

**The restart is automated, as two launches under one hold of the lock.** I wrote here for a few hours
that it could not be, and that was wrong; what could not work was the way it was first built.

    scripts/Run-PickleWsl.ps1 -Mod SkillIcons -Filter 12-restart-write.feature -Then 13-restart-read.feature

`12` writes three non-default values and leaves the settings file behind on purpose; `13`, in a game
process that did not exist when `12` ran, asserts the settings object it built at startup carries them,
loads the supplied pre-existing `test-colony` save and asserts them again, then puts the defaults back.
The object -> file -> object round trip inside one process is
`08-settings-persistence.feature`; this is the part that needs a real second process.

Three things had to be true, each learned by failing at it:

- **The sandbox has to stand down for one scenario.** `SettingsSandbox` restores the settings file in
  `[AfterScenario]`, which is the protection that stops a run leaving her sliders where a test put
  them. `12` opts out with a STEP (`SkillIcons settings are kept for the next process`), not a tag:
  Pickle collects hooks with an additive tag filter in `GetMethods` order, so a tagged hook can neither
  silence the general one nor be relied on to run before it, while steps always run between the
  before-hooks and the after-hooks.
- **The two launches must be one ticket.** As two tickets, another session's run that mounted this test
  mod between them erased the file - the sandbox's orphan cleanup did exactly what it exists to do. The
  launcher's `-Then` takes the lock once, stages once (staging again would rewrite the config and clear
  the file), and plays each filter as its own game launch.
- **The reader refuses to pass if the writer ran in the same process.** That would be a restart that
  never restarted: the in-memory object would still hold the values and every assertion would be true
  for the wrong reason. It follows that `12` and `13` cannot ride along in a plain run of the whole
  suite, where they share a process; they are launched by name.

**Measured 2026-09-21, 19:05:** launch 1 `12` passed, launch 2 `13` passed, `exitReason: passed` on
both, and the install was left clean - defaults on disk, no marker, no backup. The existing-save
assertions were added afterward and are **unverified** until this two-launch sequence is rerun. The
negative case was seen earlier the same day, by accident: with the file restored between the launches,
`13` failed with `workTabMode reads '2', expected '1'`, so the assertion does fail when nothing was kept.

## Scenario 9 — the hidden MainButtons shortcut

**Preconditions:** RIMMSQOL (or another MainButtons-customization mod) installed and active.

**Do:** on a clean configuration, check the MainButtons bar for a SkillIcons entry - expect none,
neither visible nor greyed out. In RIMMSQOL, reveal the `SkillIcons_Settings` button, click it,
change a setting, close it, then open the primary Options > Mod settings > Skill Icons entry.

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

**Do:** run the suite twice, once per language, choosing the language at launch:

    scripts/Run-PickleWsl.ps1 -Mod SkillIcons
    scripts/Run-PickleWsl.ps1 -Mod SkillIcons -Language French

The MainButtons description is asserted by `09-mainbuttons-shortcut.feature` in each startup
language. `17-rimmsqol-shortcut.feature` uses PickleTools' InterfaceScale companion to reveal,
open and capture the same shortcut at 150%; review that capture alongside the English/French
settings captures rather than performing a separate manual navigation.

**Do not switch language from inside a scenario.** It was written that way first and failed four
times: `SelectLanguage` clears and reloads every def, which takes the game apart while the runner
is standing on it - `Find.WorldObjects` returns null and `Update()` throws every frame until the
step times out. Two other explanations were believed on the way there, a five second step timeout
and Pickle's dashboard throwing during the switch. Both were real and both were veils.

**Expect:** every control label and tooltip translated, with no raw translation key, no empty
control and no text clipped or overflowing, in both passes and at both UI scales.

**Fails if:** a raw key (e.g. `SkillIcons.Speed`) is ever visible, a control is empty, or text is
clipped.

**How to read the French pass, and why counting its green proves nothing.** Every Pickle run is in
developer mode, where a key missing from the active language is *not* shown in plain English: it
is shown accented letter by letter (`a`→`à`, `c`→`ç`, `n`→`ƞ`). So accented gibberish means a
missing key, and clean English inside a French interface means a literal that never went through
`.Translate()`. The assertions catch the first; only looking at the screenshot catches the second.

**Not a defect of this mod:** the passion names in the settings gallery stay in English in the
French pass - `Blind, elevated`, `Drunken`, `Like-minded`. Those are `PassionDef.label` from Alpha
Skills and Vanilla Skills Expanded, which ship no French DefInjected. They read as clean English
rather than accented, which is the tell that no key of ours is missing. Translating them would be
a decision to take on upstream's behalf, not a repair.

**Automated, both passes green on 2026-09-21** (1487 ms English, 1677 ms French) and the French
screenshot read rather than counted: real French throughout, no raw key, no accented text, no
clipped control, the gallery hint wrapping cleanly over two lines.

## Scenario 11 — the Alpha Skills and Vanilla Skills Expanded def fixes are visible in the tooltip

**Three of the original four are gone as of 2026-09-22.** Sarg Bjornson (Alpha Skills) fixed
"nudist (active)"'s description, "pain-driven (active)"'s label, and "frozen"'s missing work tab
icon upstream, within a day of being told in a Workshop comment - the last two matching this
mod's own values exactly, byte for byte, which the out-of-game harness caught the same day (its
precondition check, "AS_FrozenPassion already has a workBoxIconPath", started failing the moment
the fix landed). All three patches were retired rather than left in place: `PatchOperationReplace`
and `PatchOperationAdd` do not check whether the target already holds the intended value, so
leaving them would have meant silently overwriting or duplicating Sarg's own fields forever, with
nothing in the log to notice it by - `<success>Always</success>` only covers a target that goes
*missing*, not one that still exists, fixed or not. See `Mod/1.6/Patches/AlphaSkills_Fixes.xml`
for the full account.

**Preconditions:** a colonist with the "blind, sublime" (either tier) or "apathy" passion state,
or `Dev` tools to force one.

**Do:** hover the passion icon in the Bio tab or Work tab for each of the two states above.

**Expect:** the two blindness tiers show visibly different icons (the sublime tier's iris a
different colour from the elevated tier's) - Sarg confirmed sharing one icon is his own
intentional design, and this mod keeps its own divergence anyway, since hue is identity for every
other passion in this set; apathy shows a Work tab icon instead of an empty cell.

**Fails if:** the blindness tiers share an icon, or apathy still shows the empty Work tab cell
(the out-of-game harness proves the patch XML changes these fields against the real installed
defs; this proves the values are what the player actually sees in the tooltip, post-loading and
post-translation).
