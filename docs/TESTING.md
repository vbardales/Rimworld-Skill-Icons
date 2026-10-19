# Testing

What actually observed, what not, how observe rest.

## The one thing to understand first

**Every failure mode here silent by design, not accident.** If Harmony transpiler finds
nothing to patch, mod no crash, no disable itself - work tab or bio
tab just keeps drawing Vanilla Skills Expanded's own icons, nothing in game UI
says why. Both transpilers log warning when patch zero
call sites, so broken patch *findable* not quietly revert to
vanilla. Clean `Player.log` proves load did not throw; not proves every icon you see
animated or colour-coded as mod intends. Positive, on-screen evidence is what
scenarios below ask for.

Log lives at:

```
%USERPROFILE%\AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\Player.log
```

## Status

Current revision (code 0332ec3, shipped as 1.0.3 on 85278dd; no `Source/` change since): out-of-game harness passes 25 of 25, every Pickle scenario green on named pass (details per ticket in `docs/runs/2026-10-10-0332ec3-summary.md`, non-regression after publication in `docs/runs/2026-10-11-85278dd-nonregression.md`). Only reds of whole-suite run are by-design 13 and 16 (see "Known consequence" below). Earlier status lines, one per scenario with dates: `docs/runs/testing-history-2026-09-to-10.md`.

## How many passes, and which

**Eight acceptance tickets, plus separate gallery (sanctuary) pass.** Mod whose TESTING.md
does not name required mod sets and process boundaries has been tried, not tested. Acceptance set: minimal/no optional, Oracle, RIMMSQOL, two-process restart chain, and one
three-feature ticket for each of Better, Compact, Enhanced and Krypt Work Tab.

Acceptance set run by named pass (below); measured results in `docs/runs/`. `Oracle` pass: `15` passing means this mod wins contest, `16` passing proves Oracle really staged, so green there worth reading.

    scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepMap wsl-deps.sans-facultatifs.map # sans-facultatifs
    scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepMap wsl-deps.avec-oracle.map \
        -Filter '15-texture-ownership.feature,16-texture-contest.feature'        # avec-oracle

Pass name written into report, so green attributable to mod set, not
"a run".

**`sans-facultatifs`** mounts Core, DLCs, Harmony, RimLogging, Pickle, hard dependencies
(Vanilla Skills Expanded and Alpha Skills), this mod, and only development-time InspectTabs
and TextureOwner vocabularies from PickleTools. No optional gameplay mod. Proves
mod stands alone; explicit map required now reusable steps no longer live in
suite's own DLL.

**`avec-oracle`** adds Oracle's Skill Icon Retextures, not formality. Oracle's set and
this one write to **same texture paths**, so whichever loads last wins - whole
reason `About.xml` names it in `<loadAfter>`. In minimal pass icon scenarios prove this
mod's textures load; here they prove `loadAfter` actually wins. **Nothing else covers
that.** `scripts/Run-Tests.ps1` reads this mod's own files, cannot see second mod overwriting
path at load, so if ordering silently broke, every scenario in suite stays green
while every player with Oracle installed sees Oracle's icons not these.

Oracle not in her active mod list; staging takes it from Workshop folder, where it
present. `Tests/Pickle/wsl-deps.avec-oracle.map` names it.

Two features this pass carries make it worth running. `15-texture-ownership.feature`
asserts WHICH mod answers for each of eleven texture paths two sets share - not pixels,
which only say "different", but RimWorld's own content holders, ones ContentFinder
searches. `16-texture-contest.feature` asserts contest real: uncontested path in
that pass means Oracle not actually staged, and 15 would pass for wrong reason. It
separate file, named in pass that wants it. Tag can SELECT what launch runs, but I found
no way make one EXCLUDE scenario from plain run, and scenario that must not run in
minimal pass must be kept out by something more certain than tag I not seen work.

**Known consequence, not yet resolved: plain run of whole suite is red.** `16` fails without
Oracle staged, by design, and `13` refuses to pass when `12` ran in same process, also by
design - restart test that never restarted proves nothing. Until those three live in companion
suite plain launch does not select, pass names above only correct way to run
them, and plain pass should be read with those three scenarios set aside.

No optional of this mod incompatible with another. Four Work-tab passes are explicit
compatibility matrix because each replacement owns different visible Work interface; not
combinatorial fan-out.

**`11-gallery-sanctuary.feature` belongs to `sanctuary` pass only** (2026-10-08, replaces zen-studio `11-publication-shots.feature`). Run with
`wsl-deps.sanctuary.map`, which stages PickleTools' ScreenshotStudio, CameraZoom, StageDecor, ClearScreen, InspectTabs, ScreenshotMode and ColonistRace companions and loads Sanctuary of Nelim (`Nelims-tribe`);
functional scenarios keep their
existing fixtures and maps.
Any third-party skill or work interface may redraw what it photographs - Bio Tab+ draws own
character card, never reaches this mod's transpiler; third-party Work tab replacement shows
none of these icons - so capture taken with those loaded would advertise someone else's
interface on this mod's store page.

## Which proofs to keep

Pickle reports pile up, disk finite, so keep only what still proves something.

- **On disk, ignored by git:** `Tests/Pickle/Evidence/<run>/`, written by launcher's
  `-EvidenceDir`. Keep latest report per scenario for revision now in repository. Keep
  older one only when sole proof of check latest run did not repeat. Delete report as soon as newer one replaces it; report about superseded build proves nothing
  about current one.
- **In git:** one text summary per run in `docs/runs/`, never folder of reports or captures.
  `STATUS.md` points at that summary, never at file that may be deleted.
- **What this mod keeps (2026-10-11):** run summaries in `docs/runs/` (`2026-09-20-2319`, `2026-09-23-44fde64`, `2026-10-10-0332ec3`, `2026-10-11-85278dd-nonregression`, `2026-09-21-restart`, `2026-09-21-shortcut`), and on disk under `Tests/Pickle/Evidence/` latest report of passes next run does not repeat (RIMMSQOL, Oracle, two-process restart, Sanctuary gallery, 1011 non-regression pair); 1010 Work Tab matrices, French and feature 01 reports pruned 2026-10-11 once summary in `docs/runs/`.
- **Images:** no PNG or GIF from test run versioned (`docs/runs/*.png` and `*.gif` ignored; two shortcut-bar PNGs removed from git 2026-10-08). Capture worth citing described in run summary. `Art/Gallery/` is Workshop gallery, not test evidence.
- **To keep after every run:** `junit.xml`, `summary.json`, `summary.md`, `exit.txt`; drop `Player.log`, `messages.ndjson` and screenshots once newer run replaces them.
- **Rerun rule:** change to mod's code invalidates these passes, run again. Change that only moves or documents code (`Source/` relocation, CI files) does not; say
  so in `STATUS.md` instead of rerunning.
- **`.dds` files** are RimWorld's per-machine texture cache next to PNGs, ignored by git.

## The other half, which does not need a colony

`scripts/Run-Tests.ps1` runs twenty-five tests without starting game:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\Run-Tests.ps1
```

Asks different question from this file: whether settings clamps, Harmony patch targets, MainButtons wiring, animation
frame table and two Alpha Skills/VSE patch files still do what mod claims, checked
against compiled DLL and real installed dependency mods - not whether colonist ever
sees result on screen. Two things found worth recording while written:

- `Verse.PatchOperationSequence` is **chain**: stops at first sub-operation whose xpath
  matches nothing at all. `AlphaSkills_Fixes.xml` held its five fixes in one, so they shared
  single point of failure - if Alpha Skills ever dropped or renamed `AS_NudistPassion_Active`
  while other four bugs remained, none of other four fixes would apply either, and
  `<success>Always</success>` would keep log clean about it. **Split into five independent
  top-level operations 2026-09-21**, each with own `<success>Always</success>`, and harness test that used to assert damage now asserts its absence.
- Two Alpha Skills def fixes checked against real, currently-installed defs, not
  hand-typed copy: `AS_NudistPassion_Active`'s description genuinely is
  `AS_NomadicPassion` text, copy-pasted, and `AS_PainDrivenPassion_Active`'s label genuinely is
  still `"pain-driven"`, both confirmed on disk before patch runs.

Neither half replaces other. Nothing there sees heart-shaped icon animate in bio tab.

## Scenario 0 — it loaded

**Do:** start game with mod active, Harmony, Vanilla Skills Expanded and Alpha Skills all
present.

**Expect:** one line naming loaded assembly's build date:

```
[SkillIcons] assembly dated <yyyy-MM-dd HH:mm:ss>
```

Compare date/time against actual file time of `Mod/1.6/Assemblies/SkillIcons.dll` -
must match. Mismatch means loaded DLL not one on disk, and every scenario
below describes build not actually running.

**Then filter log for classics, and for this mod's own warnings:**

```
Select-String -Path "$env:USERPROFILE\AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\Player.log" -Pattern '^(XML error|Config error|Could not resolve|Could not find)|^\[SkillIcons\]'
```

**Fails if:** assembly-date line missing, or any of these three appear (each names
exact transpiler/prefix that found nothing to patch, and interface area it leaves showing
Vanilla Skills Expanded's own icons instead):

```
[SkillIcons] No call to PassionDef.WorkBoxIcon found in DrawWorkBoxBackground: the Work tab icons will stay Vanilla Skills Expanded's own. Check that SkillIcons is loaded after it.
[SkillIcons] WorkBoxIcon hijacked N times, but no recognised draw call followed: the Work tab icons will be ours, without the size or opacity settings.
[SkillIcons] No call to PassionDef.Icon found in SkillUI.DrawSkill: the skill list and pawn creation screen will keep Vanilla Skills Expanded's own icons.
```

**Observed, 2026-09-17.** Read directly from `Player.log` after session that also ran
Pickle suite (see `STATUS.md`, "In-game Pickle run"): assembly-date line reads
`[SkillIcons] assembly dated 2026-09-17 14:36:21`, matching `Mod/1.6/Assemblies/SkillIcons.dll`'s
own file time on disk to the second. None of three failure warnings appear anywhere in
log, and no `XML error`/`Config error`/`Could not resolve`/`Could not find` line mentions
SkillIcons. Passed.

## Scenario 1 — passion icons appear in all four places

**Preconditions:** scenario 0 passed. Colonist with at least one passion in each state (none,
dormant, live/triggered) - pawn creation screen or `Dev: Regenerate id` few times usually
gets mixed set quickly.

**Do:** open pawn creation screen, then colonist's Bio tab, then Work tab.

**Expect:** same heart-shaped icon set (not vanilla flame/star icons) in all three
places, colour-coded by hue per passion, live ones noticeably brighter than dormant
ones. Passions with animation sequence (most of forty) visibly move - padlock opens
and closes, bubbles rise in champagne glass, mood icon drifts along its scale.

**Fails if:** any of three places still shows Vanilla Skills Expanded's own flame/star icons,
or icon that should animate never moves.

**Animation automated as of 2026-09-21** (`14-animation-runs.feature`), no longer needs
watching. Asks `PassionDef.Icon` - call site game itself draws from, so transpiler
that stopped applying fails here too - what texture passion shows, twice, thirty frames apart.
`AS_DrunkenPassion_Active` and `VSE_Apathy` must answer differently; `AS_BlindPassion_Elevated`
and `AS_NudistPassion`, no animation, must answer identically. Second scenario
gives first its meaning: "texture changed" alone does not distinguish animation
running from anything else changing. Both green first run.

**Pawn creation screen: observed, 2026-09-18.** Her own screenshot of `Page_ConfigureStartingPawns`
shows coloured heart icons per skill, correctly varying with value (hollow/pale at 0, filled and
differently coloured above) - matches expectation, not vanilla flame/star set.

**Work tab: observed and confirmed, 2026-09-18.** Zoomed into new Pickle suite's own
`manual--work-tab-mixed-passions--step0.png`: real dark-red heart icons appear in
"Passionate" colonist's row, mixed with plain green checkmarks elsewhere. "Priorité
manuelle ❌" header confirms this is **real vanilla `MainTabWindow_Work`** in its
checkbox-priority mode, not third-party Work tab replacement observed earlier - `I open the
"Work" tab"` reaches real class directly regardless of what her own interface currently has
bound. Resolves `Tests/Pickle/README.md` "real uncertainty" note. She then confirmed
same directly, live, on her own game (full-width screenshot of same "Priorité manuelle ❌"
window across three colonists, coloured hearts clearly varied - red, orange/gold - across
different skills), and separately confirmed **icons animate in this vanilla window**. Fails-if
conditions for Work tab: not met. Passed.

**Bio tab: observed, 2026-09-19.** `I close all dialogs` fix landed: rerun's
`manual--bio-tab-mixed-passions--step0.png` shows character card unobstructed, and mix custom step
set is exactly what drawn - Shooting cleared and iconless, Mining hollow heart
(Minor), Cooking and Plants filled red hearts (Major, and granted `VSE_Natural`), Melee
distinct pink spiral. Heart set, not vanilla flame/star, varying with state. Passed. Cropped to
`Art/Gallery/7-bio-tab-skills.png`.
Third-party skill/work UI observed meantime, 2026-09-18, recorded here as extra evidence
not verdict on this scenario:

- **Character Editor** (skill list): coloured heart icons present, correctly varied by passion
  state, **confirmed animating**.
- **Bio Tab+** (character card, `Axolki.BioTabPlus`): coloured heart icons present, **static, does
  not animate**. **Correction, same day:** first recorded here as "Modern Bio" - she
  not have that mod installed at all; was Bio Tab+ both times, one screenshot mislabeled.
  Expected by design, not defect: `[Bio Tab+] Character card patches applied.` in `Player.log`
  confirms it draws own card, not calling `RimWorld.SkillUI.DrawSkill`. Icon itself
  likely comes from patched `PassionDef.Icon` getter, reached from anywhere; animation is
  injected by Harmony transpiler targeting that specific method's IL, which mod drawing own
  card never reaches. No compatibility patch warranted for this alone: icon (shape, colour,
  passion state) already correct, only animation flourish missing, and per-UI-mod patch
  would not scale to every skill-list replacement out there. Considered and declined 2026-09-18.
- **Third-party Work tab replacement** (priority grid with text-only diagonal column headers):
  **no SkillIcons icon at all**, anywhere in grid or headers. Same reasoning: this mod draws
  own grid, never calling `WidgetsWork.DrawWorkBoxBackground` or `DoHeader` prefix. Whether
  vanilla Work tab still reachable on this modlist, for Scenarios 1/3/4/6/7, unconfirmed.

## Scenario 2 — the settings page opens from the primary entry and matches its documented defaults

**Do:** Options > Mod settings > Skill Icons, on clean configuration (no prior `Mod_SkillIcons_*`
settings file, or one deleted first).

**Expect:** animated passion icons checked; speed slider at 1.0x; "no passion" icon
unchecked; work tab mode set to **Mixed**; work tab icon size 130%, opacity 85%. Live gallery below controls lists every installed passion, twice each
(skill-list icon, work-tab icon), animating at chosen speed.

**Fails if:** any default differs from list above (out-of-game harness proves
`ExposeData` clamps and defaults in isolation; this proves same values reach actual
window).

## Scenario 3 — the three work tab modes actually change what is drawn

**Preconditions:** colonist with at least one live and one dormant passion, Work tab open in
second window or quickly reopened after each change.

**Do:** in settings, switch work tab mode through **Colour**, **Greyed**, then back to
**Mixed**.

**Expect:** in Colour, every passion icon in Work tab full-colour regardless of state. In
Greyed, every icon uses two-grey variant, matching Vanilla Skills Expanded's own prior
behaviour. In Mixed, only live passion full-colour; dormant one grey.

**Fails if:** any mode fails to change what is drawn, or Mixed does not distinguish live from
dormant.

**Failed 2026-09-19, fixed, confirmed fixed 2026-09-20 - see confirmation at end of this scenario.** Pickle
suite's three captures (`work-tab-mode-colour|grey|mixed`) same image. Measured, not
eyeballed: over priority grid three differ by 0.2-0.5% of bytes, which is animation-frame
noise, and discriminating counts flat - 5045 / 5027 / 5060 red pixels and 0.3208 / 0.3201 /
0.3191 mean saturation. If Greyed desaturated anything red count would collapse. At 6x zoom same
hearts sit in same cells in all three.

Not harness artifact: steps write live static `SkillIconsMod.Settings` drawing code
reads, and Scenario 4's sliders, acting on same cells through same patched path, changed
drawing dramatically in same run. Mode alone did nothing.

Cause, in `PassionIconAnimations.cs`: `WorkBoxAnimatedIcon` picked right texture per mode -
`Icon` in colour, `WorkBoxIcon` in grey - then handed it to `AnimatedIconOrFallback`, which ignores
texture given whenever passion has animation and returns frame instead. Every
frame drawn in colour; no grey frame set. So for forty animated passions all three
modes drew same coloured frame, and fallback carrying mode discarded. Fixed by
giving helper `animate` flag and passing `false` on grey path, so asleep bonus draws
static grey icon, does not animate.


**Confirmed fixed, 2026-09-20.** Trio re-shot on run after fix, and
measured same way as failure, so two numbers comparable. Before: 5045 / 5027 /
5060 red pixels and 0.3208 / 0.3201 / 0.3191 mean saturation across priority grid - flat.
After: **5027 / 4532 / 4735** and **0.3208 / 0.2990 / 0.3083** - ordering in expected
direction, colour above mixed above grey.

Zoom settles it beyond numbers. In colour every heart red; in greyed every heart
grey, without exception; in mixed live passion red and dormant ones grey. That last
part numbers alone could not show, and it is behaviour mode exists for.

Why grey still reads ~4500 red pixels not none: measured region includes work
tab's own red priority-box borders and cell backgrounds, not passion icons, never
change with mode.

## Scenario 4 — work tab size and opacity sliders have a visible, reversible effect

**Do:** with colonist's Work tab open, drag icon size slider to minimum then maximum,
and opacity slider to minimum then maximum, returning each to default afterward.

**Expect:** icon visibly grows/shrinks with size slider; icon fades toward
transparent and back with opacity slider, and priority digit underneath becomes easier to
read as opacity drops. Both revert cleanly to 130%/85% defaults.

**Fails if:** either slider no visible effect, or values do not survive being set back to
defaults (compare against Scenario 2 after reverting).

## Scenario 5 — the "no passion" icon is off by default and, when enabled, is not more prominent than a real passion

**Do:** find skill with no passion at all. Confirm nothing drawn there by default. Enable
"show an icon for no passion" in settings, reopen Bio tab.

**Expect:** by default, empty space, matching vanilla. Enabled, faint hollow heart outline
appears, visibly dimmer/less prominent than any real passion's icon on same pawn.

**Fails if:** icon visible before option enabled, or as bright as (or brighter
than) active passion once enabled.


> **Scenarios 6 and 7 removed 2026-09-19**, with feature they tested. Skill and
> work type icon set — twelve skill icons, twenty-three work type icons, their two
> toggles and three column-header modes — moved to Work Studio, which owns work types and
> was already designing per-type icon in own backlog. SkillIcons draws passions only. Numbering left with gap on purpose: this file, `STATUS.md` and several commit messages all
> cite scenarios by number, renumbering would silently invalidate every one of those citations.

## Scenario 8 — settings persist across reopen, restart, and a reloaded save

**Do:** change several settings (work tab mode, speed, one checkbox), close and reopen
settings window, then fully restart RimWorld, then load existing save from before
settings change.

**Expect:** changed values survive reopening window and restarting game (mod
settings global, not per-save) - including after loading older save, since not
scribed into save file.

**Fails if:** any value reverts on reopen or restart.

**Restart automated, as two launches under one hold of lock.** I wrote here for few hours
it could not be, and that wrong; what could not work was way it was first built.

    scripts/Run-PickleWsl.ps1 -Mod SkillIcons -Filter 12-restart-write.feature -Then 13-restart-read.feature

`12` writes three non-default values and leaves settings file behind on purpose; `13`, in game
process that did not exist when `12` ran, asserts settings object it built at startup carries them,
loads supplied pre-existing `test-colony` save and asserts them again, then puts defaults back.
Object -> file -> object round trip inside one process is
`08-settings-persistence.feature`; this is part that needs real second process.

Three things had to be true, each learned by failing at it:

- **Sandbox has to stand down for one scenario.** `SettingsSandbox` restores settings file in
  `[AfterScenario]`, protection that stops run leaving her sliders where test put
  them. `12` opts out with STEP (`SkillIcons settings are kept for the next process`), not tag:
  Pickle collects hooks with additive tag filter in `GetMethods` order, so tagged hook can neither
  silence general one nor be relied on to run before it, while steps always run between
  before-hooks and after-hooks.
- **Two launches must be one ticket.** As two tickets, another session's run that mounted this test
  mod between them erased file - sandbox's orphan cleanup did exactly what it exists to do. Launcher's `-Then` takes lock once, stages once (staging again would rewrite config and clear
  file), and plays each filter as own game launch.
- **Reader refuses to pass if writer ran in same process.** That would be restart that
  never restarted: in-memory object would still hold values and every assertion would be true
  for wrong reason. It follows `12` and `13` cannot ride along in plain run of whole
  suite, where they share process; launched by name.

**Measured 2026-09-21, 19:05:** launch 1 `12` passed, launch 2 `13` passed, `exitReason: passed` on
both, install left clean - defaults on disk, no marker, no backup. Existing-save
assertions added afterward and **unverified** until this two-launch sequence rerun. Negative case seen earlier same day, by accident: with file restored between launches,
`13` failed with `workTabMode reads '2', expected '1'`, so assertion does fail when nothing kept.

## Scenario 9 — the hidden MainButtons shortcut

**Preconditions:** RIMMSQOL (or other MainButtons-customization mod) installed and active.

**Do:** on clean configuration, check MainButtons bar for SkillIcons entry - expect none,
neither visible nor greyed out. In RIMMSQOL, reveal `SkillIcons_Settings` button, click it,
change setting, close it, then open primary Options > Mod settings > Skill Icons entry.

**Expect:** no visible or greyed-out button before revealed. Once revealed and clicked, opens identical settings window - same controls, same current values - as primary entry;
change made through one visible through other, since both open same
`Dialog_ModSettings` for same loaded mod instance. Hiding button again in RIMMSQOL
persists across restart.

**Fails if:** button visible or greyed out before revealed, opens different or
reduced set of controls, or change made via one entry point not visible via other (out-of-game
harness proves IL calls `LoadedModManager.GetMod<SkillIconsMod>()` and
`Dialog_ModSettings`'s constructor; this proves two entry points actually agree on screen).

## Scenario 10 — English and French

**Do:** run suite twice, once per language, choosing language at launch:

    scripts/Run-PickleWsl.ps1 -Mod SkillIcons
    scripts/Run-PickleWsl.ps1 -Mod SkillIcons -Language French

MainButtons description asserted by `09-mainbuttons-shortcut.feature` in each startup
language. `17-rimmsqol-shortcut.feature` uses PickleTools' InterfaceScale companion to reveal,
open and capture same shortcut at 150%; review that capture alongside English/French
settings captures, not separate manual navigation.

**Do not switch language from inside scenario.** Written that way first and failed four
times: `SelectLanguage` clears and reloads every def, taking game apart while runner
standing on it - `Find.WorldObjects` returns null and `Update()` throws every frame until
step times out. Two other explanations believed on way there, five second step timeout
and Pickle's dashboard throwing during switch. Both real, both veils.

**Expect:** every control label and tooltip translated, no raw translation key, no empty
control, no text clipped or overflowing, in both passes and at both UI scales.

**Fails if:** raw key (e.g. `SkillIcons.Speed`) ever visible, control empty, or text clipped.

**How to read French pass, and why counting its green proves nothing.** Every Pickle run in
developer mode, where key missing from active language *not* shown in plain English: it
shown accented letter by letter (`a`→`à`, `c`→`ç`, `n`→`ƞ`). So accented gibberish means
missing key, and clean English inside French interface means literal that never went through
`.Translate()`. Assertions catch first; only looking at screenshot catches second.

**Not defect of this mod:** passion names in settings gallery stay English in
French pass - `Blind, elevated`, `Drunken`, `Like-minded`. Those are `PassionDef.label` from Alpha
Skills and Vanilla Skills Expanded, which ship no French DefInjected. Read as clean English
not accented, tell that no key of ours missing. Translating them would be
decision to take on upstream's behalf, not repair.

**Automated, both passes green 2026-09-21** (1487 ms English, 1677 ms French) and French
screenshot read not counted: real French throughout, no raw key, no accented text, no
clipped control, gallery hint wrapping cleanly over two lines.

## Scenario 11 — the Alpha Skills and Vanilla Skills Expanded def fixes are visible in the tooltip

**Three of original four gone as of 2026-09-22.** Sarg Bjornson (Alpha Skills) fixed
"nudist (active)"'s description, "pain-driven (active)"'s label, and "frozen"'s missing work tab
icon upstream, within day of being told in Workshop comment - last two matching this
mod's own values exactly, byte for byte, which out-of-game harness caught same day (its
precondition check, "AS_FrozenPassion already has a workBoxIconPath", started failing moment
fix landed). All three patches retired not left in place: `PatchOperationReplace`
and `PatchOperationAdd` do not check whether target already holds intended value, so
leaving them would mean silently overwriting or duplicating Sarg's own fields forever, with
nothing in log to notice it - `<success>Always</success>` only covers target that goes
*missing*, not one that still exists, fixed or not. See `Mod/1.6/Patches/AlphaSkills_Fixes.xml`
for full account.

**Preconditions:** colonist with "blind, sublime" (either tier) or "apathy" passion state,
or `Dev` tools to force one.

**Do:** hover passion icon in Bio tab or Work tab for each of two states above.

**Expect:** two blindness tiers show visibly different icons (sublime tier's iris
different colour from elevated tier's) - Sarg confirmed sharing one icon is his own
intentional design, and this mod keeps own divergence anyway, since hue is identity for every
other passion in this set; apathy shows Work tab icon instead of empty cell.

**Fails if:** blindness tiers share icon, or apathy still shows empty Work tab cell
(out-of-game harness proves patch XML changes these fields against real installed
defs; this proves values are what player actually sees in tooltip, post-loading and
post-translation).

## Alpha Skills became optional (2026-10-08)

Alpha Skills left `modDependencies` for `loadAfter` only. Scenarios needing its defs carry `@requires:sarg.alphaskills`
(01 load order, 03 passion icons, 06 def fixes, 14 animation); play in `wsl-deps.avec-alphaskills.map`. Pass
without optionals plays others and proves mod loads without it. Both passes to be run on final revision;
neither run since change.

## Enhanced Work Tab: the three modes are identical by design (investigated 2026-10-10)

2026-10-10 captures of Enhanced Work Tab matrix (`colour`, `grey`, `mixed`, and size and opacity sliders) pixel-identical to each other (frame difference 0), while Better Work Tab ones differ (maximum difference 42). Cause, read in decompiled `EnhancedWorkTab.dll` (Workshop 3715873875): `EnhancedWorkBoxDrawer.DrawWorkBox` calls vanilla `DrawWorkBoxBackground` through delegate then draws own cell, own priority digit and own passion marker (`DrawPassionMarker`: vanilla `WidgetsWork.PassionWorkboxMajorIcon` / `PassionWorkboxMinorIcon` at 40 % alpha). Nothing of this mod's icon survives in that cell, so Work tab settings have no visible effect under Enhanced Work Tab. Mod cannot hook in without patching internals of another mod. Known limit, not defect: Enhanced matrix only proves mod loads and replacement tab opens. "Visibly distinct" wording of 2026-09-22 record does not hold for Enhanced and is superseded by this section.