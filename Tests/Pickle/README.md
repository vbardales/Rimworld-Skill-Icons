# In-game scenarios, run by Pickle

The scenarios of [docs/TESTING.md](../../docs/TESTING.md), written in Gherkin and played inside a
running RimWorld by [Pickle](https://github.com/RimWorks/Rimworld-Pickle) (`rimworks.pickle`,
Workshop 3791648678).

`Mod/` is a companion mod, **SkillIcons - Pickle tests**, never published. It holds the feature
files and, since this pass, a companion steps assembly, so nothing test-related ships in the
Workshop folder.
## What a reviewer has to do

Run each documented pass through the shared WSL launcher, then open only the `@review` media
attached to a passing, complete report. Every behavioral setup, interaction, restart, settings
round trip and RIMMSQOL reveal/hide is asserted by Pickle. There is no audio behavior in this mod,
so no scenario pauses for human listening.

1. Check `summary.md`: `exitReason: passed`, the expected feature/scenario count and no required
   scenario skipped.
2. Open the named screenshots (or a film where a feature produces one). These are the only
   human decisions: visual correctness cannot be inferred from a green capture step.

| screenshot | the one question to answer |
|---|---|
| `work tab mode colour` / `grey` / `mixed` | Settled 2026-09-20: colour all red, greyed all grey, mixed red for the live passion and grey for the dormant ones. Only worth re-checking if the drawing changes |
| `no passion icon off` / `on` | Does a faint hollow heart appear only in the second, and is it clearly dimmer than the filled heart on the row below? |
| `settings page in French` | Any raw key like `SkillIcons.Speed`, any empty control, any text running past its edge? |
| `settings opened by the MainButtons shortcut` | Is this the same settings window the Options menu opens? |

`17-rimmsqol-shortcut.feature` adds three RIMMSQOL captures in the `avec-rimmsqol` pass. Its
shared PickleTools steps perform the reveal/hide and settings-file checks; the reviewer only reads
the resulting list, edit-page and opened-settings captures.

The four replacement-work-tab maps deliberately reuse `03-passion-icons.feature`,
`04-worktab-modes.feature` and `05-worktab-sliders.feature`: those features open the active Work
tab, assert the window attached to the live Work MainButtonDef, drive the mod-owned modes/sliders and attach the visual
evidence. Run the three-feature filter once with each of `avec-betterworktab`,
`avec-compactworktab`, `avec-enhancedworktab` and `avec-krypt-worktab`; review the Work-tab
captures from each complete report. No separate manual navigation is required.

`11-publication-shots.feature` is not part of that check. It takes two images for the Workshop
page with the interface hidden, asserts nothing, and needs no judgement from you - I read those.


## Setup, once

1. Subscribe to Pickle and RimLogging, and enable both.
2. Link both this repository's `Mod/` and the companion mod into RimWorld's `Mods` folder. The
   local link matters: with the Workshop copy subscribed too, the game would name that one
   differently and the steps would be built against the wrong assembly.

   ```powershell
   $mods = "C:\Program Files (x86)\Steam\steamapps\common\RimWorld\Mods"
   New-Item -ItemType Junction -Path "$mods\SkillIcons" -Target "<repo>\Mod"
   New-Item -ItemType Junction -Path "$mods\SkillIconsPickleTests" -Target "<repo>\Tests\Pickle\Mod"
   ```

   Done for this machine on 2026-09-17.
3. Enable SkillIcons (with Harmony, Vanilla Skills Expanded and Alpha Skills all present), then
   the companion mod below it and Pickle.

Pickle patches the game through Concord when Concord is loaded, and through Harmony otherwise. If
Concord fails to start ("Failed to initialize Concord" in the log), none of Pickle's hooks land:
every step that needs one fails. Disable Concord for the run.

## Build

```powershell
dotnet build Tests/Pickle/Source/SkillIcons.PickleSteps.csproj -c Release
```

The output goes to `Mod/Pickle/Assemblies/`. It binds to `Mod/1.6/Assemblies/SkillIcons.dll`, so
build the mod first if it is stale:

```powershell
dotnet build _tools/animation-source/Source/SkillIcons/SkillIcons.csproj -c Release
```

Feature files need no build either way.

## Run

- **Headless WSL only**: use `scripts/Run-PickleWsl.ps1` from the collection root, as specified in
  `AUDIT.md` and `PickleTools/Headless/README.md`. Never launch the Windows game or stage a pass by
  hand. Reports land in `pickle-reports`: `report.html`, `junit.xml`, `summary.md`.

**What has actually run.** The named acceptance passes are complete as of 2026-09-22. The
dedicated RIMMSQOL feature passed 4/4; the restart writer and existing-save reader passed 1/1 and
1/1 in distinct processes; Better, Compact, Enhanced and Krypt Work Tab each passed the same
three-feature matrix 3/3. All attached review media were opened. Earlier full and named passes are
recorded in `docs/TESTING.md` and `STATUS.md`; always read the current run's own `summary.md`
rather than treating this paragraph as a substitute for a report.

## What the suite does to your files

- **Settings.** Before each scenario `SettingsSandbox` copies
  `Mod_SkillIconsPickleTests_...` - whatever `LoadedModManager.GetSettingsFilename` resolves for
  the linked mod folder name - to a `.pickle-backup` beside it, resets `SkillIconsMod.Settings` to
  a fresh, default-valued instance, and runs the scenario against that. Afterwards the real file is
  restored and reloaded. If the game dies mid-scenario, the next run's `[BeforeScenario]` restores
  the backup first, exactly as WorkStudio's and ArchitectStudio's own `SettingsSandbox` do. **If a
  `.pickle-backup` file is ever left in `Config/` and no further run is planned, copy it back over
  the settings file by hand.**
- **Pawns and hediffs.** `PassionSteps` sets `SkillRecord.passion` directly and, for
  `... is granted the passion def "..."`, adds a real Hediff to the colonist it names. Nothing is
  written back to `test-colony`: every scenario's `Background` reloads that save fresh
  (`Given the save "test-colony" is loaded`), the same fixture pattern `pawn-steps.feature` and
  every sibling suite use, so nothing a scenario does to a pawn survives into the next one.
- **Screenshots.** `02`, `03`, `04`, `05`, `07`, `09` and `10` each end in one or more `I take a screenshot "..."` steps,
  tagged `@review`. Nothing about their pixels is asserted; a person (or a later Claude session
  with the report's images) looks and judges, the same pattern as ArchitectStudio's
  `04b-arrows-at-150-percent.feature`.

## How the scenarios reach the mod

`SkillIconsMod.Settings` is declared `internal` in `SkillIcons.dll`, so `Driver.Settings(ctx)`
reaches it once by reflection; `SkillIconsSettings` itself and every field on it are public, so
once the object is in hand the steps use it like any other typed reference - no further reflection
per field. `PassionSteps` resolves a colonist the same way `WorkStudio.PickleSteps.ColonySteps`
does (`PawnsFinder.AllMaps_FreeColonists`, matched by `Name.ToStringShort`), and reads/writes
`SkillRecord.passion` directly - a plain public field, not a private one reached through the mod.
Pawn Character tabs are opened and asserted through PickleTools' shared `InspectTabs` companion.
The local `BioTabSteps` copy was removed once a second suite needed the same behavior. The shared
step selects the visible `ITab_Pawn_Character` through RimWorld's own inspect-pane API and names it
by the stable identifier `Character`, not by a translated player-facing label.

## Steps are scoped, deliberately

Pickle keeps ONE step table for every suite loaded at once, so two mods declaring the same phrase
collide on "Ambiguous step" and both fail. Local steps therefore name SkillIcons in their phrase.
Reusable behavior is instead supplied by explicitly staged PickleTools companions, whose
`Nelim's Pickle Tools:` prefix is global by design. InspectTabs, ScreenshotMode and TextureOwner
replaced the three local copies in this suite on 2026-09-22.

No phrase carries a literal double quote either. One did - `SkillIcons "no passion" icon is
turned {string}` - and it worked, its scenario passing on 2026-09-20. It was still renamed to
`SkillIcons no-passion icon is turned {string}` on 2026-09-21: a literal quote sitting next to a
`{string}` parameter is ambiguous to read and invites a Cucumber-expression parser to treat it as
a parameter delimiter. It also made the step unreadable in any listing that does not resolve C#
escaping, where `[When("SkillIcons \"no passion\"...` reads as a broken string - which is exactly
how it was reported.

The steps that stay unscoped are Pickle's own - `I close all dialogs`, `I take a screenshot`,
`def "..." field "..." is "..."` and the rest. Those belong to `Pickle.Vanilla` and are shared on
purpose.

## No pure-manual scenarios

The historic pawn-creation observation is evidence from 2026-09-18, not a current acceptance
step. The screen reaches the same `SkillUI.DrawSkill` path that the suite verifies through the
Bio tab, Work tab and the animation getter checks. The suite has no audio, and every remaining
runtime acceptance item is either asserted or represented by a `@review` capture. Alpha Skills'
own real-world trigger conditions are deliberately not faked: the suite exercises the mod's
documented rendering rule with installed `VSE_Natural`, rather than writing a brittle test of
Alpha Skills' gameplay.

## Required done-to-tested passes — completed 2026-09-22

These are the commands that produced the completed `done -> tested` evidence. Future regression
runs must still use the collection's launcher and examine their own complete report and media.

```powershell
scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepMap wsl-deps.avec-rimmsqol.map -Filter 17-rimmsqol-shortcut.feature
scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepMap wsl-deps.sans-facultatifs.map -Filter 12-restart-write.feature -Then 13-restart-read.feature
scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepMap wsl-deps.avec-betterworktab.map -Filter '03-passion-icons.feature,04-worktab-modes.feature,05-worktab-sliders.feature'
scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepMap wsl-deps.avec-compactworktab.map -Filter '03-passion-icons.feature,04-worktab-modes.feature,05-worktab-sliders.feature'
scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepMap wsl-deps.avec-enhancedworktab.map -Filter '03-passion-icons.feature,04-worktab-modes.feature,05-worktab-sliders.feature'
scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepMap wsl-deps.avec-krypt-worktab.map -Filter '03-passion-icons.feature,04-worktab-modes.feature,05-worktab-sliders.feature'
```

## Real uncertainty, not yet resolved by anything short of a real run

**Resolved, her first real run, 2026-09-18:** `I open the "Work" tab` does reach the real
`RimWorld.MainTabWindow_Work`, confirmed by zooming into that run's own
`work-tab-mixed-passions` screenshot - real heart icons visible in the "Passionate" row, and the
window's own "Priorité manuelle ❌" header identifies it as vanilla's checkbox-priority mode. This
is a different window from the third-party Work tab replacement seen in her manual screenshots:
Pickle opens the class directly, regardless of what her own interface currently has bound.

- The equivalent Bio tab screenshot from that same run was useless - a `RimLogging` log-viewer
  window, left open from an earlier scenario in the run, covered the whole screen. Added
  `And I close all dialogs` before opening the Bio tab in `03-passion-icons.feature`; unconfirmed
  until the next real run.
- `PassionSteps.GrantPassionDef`'s Hediff grant was checked by reflection (the field exists, the
  types resolve) but never by seeing a "_Active" icon draw - see `PassionSteps.cs`'s header
  comment for exactly what is and is not claimed.
