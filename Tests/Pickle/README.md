# In-game scenarios, run by Pickle

The scenarios of [docs/TESTING.md](../../docs/TESTING.md), written in Gherkin and played inside a
running RimWorld by [Pickle](https://github.com/RimWorks/Rimworld-Pickle) (`rimworks.pickle`,
Workshop 3791648678).

`Mod/` is a companion mod, **SkillIcons - Pickle tests**, never published. It holds the feature
files and, since this pass, a companion steps assembly, so nothing test-related ships in the
Workshop folder.
## What you actually have to do

One run, then look at seven pictures. Everything else in this file is background.

1. Start RimWorld with the mod list below, dev mode on, and run the SkillIcons suite from the
   debug actions menu (or use the unattended command). Ten scenarios.
2. Open `PickleReports/summary.md` beside your saves. Every scenario should read Passed. A failure
   names its own step, so there is nothing to diagnose by hand.
3. Open `PickleReports/screenshots/` and look at these seven, which is the part no assertion can
   do for you:

| screenshot | the one question to answer |
|---|---|
| `work tab mode colour` / `grey` / `mixed` | Settled 2026-09-20: colour all red, greyed all grey, mixed red for the live passion and grey for the dormant ones. Only worth re-checking if the drawing changes |
| `no passion icon off` / `on` | Does a faint hollow heart appear only in the second, and is it clearly dimmer than the filled heart on the row below? |
| `settings page in French` | Any raw key like `SkillIcons.Speed`, any empty control, any text running past its edge? |
| `settings opened by the MainButtons shortcut` | Is this the same settings window the Options menu opens? |

Then tell me what you saw, and I will record it. What remains after that is the short table at the
bottom of this file - a real restart, RIMMSQOL's own reveal/hide, and the pawn creation screen.

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

- **In game**: dev mode on, debug actions menu, *Pickle*. Tick the SkillIcons suite, *Run selected*.
- **Unattended**: `RimWorldWin64.exe "-pickle-run=SkillIcons - Pickle tests"`. The filter is the
  companion mod's name, exactly; without it Pickle also runs its own sample features. Reports land
  in `PickleReports` beside the saves: `report.html`, `junit.xml`, `summary.md`.

**What has actually run.** Scenarios 01 to 05 ran on 2026-09-19: all passed, and 04 is the one
that exposed the grey-mode defect - by its screenshots, not by an assertion. Scenarios 06 to 10
were written on 2026-09-20 and have never been executed; `dotnet build` proves their C# and
Cucumber expressions are well formed against the real compiled assemblies, and nothing more.
Read `PickleReports/summary.md` after the run rather than trusting this paragraph.

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
`BioTabSteps` opens the pawn's Character tab through `MainTabWindow_Inspect.openTabType`, a public
`Type` field on a vanilla RimWorld class, confirmed by reflection against the installed
`Assembly-CSharp.dll` while writing this suite (Pickle's own generic vocabulary has no step for
an `ITab`, only for `MainTabWindow`-level tabs opened by their `MainButtonDef` label).

## Steps are scoped, deliberately

Pickle keeps ONE step table for every suite loaded at once, so two mods declaring the same
phrase collide on "Ambiguous step" and both fail. Every step this suite declares therefore names
SkillIcons in its phrase - `SkillIcons opens the Bio tab for "..."`, not `I open the Bio tab for
"..."`. Seven were generic until 2026-09-20 and were renamed then, on a warning from the Work
Studio session; nothing had collided yet, which is exactly when it is cheap to fix.

The steps that stay unscoped are Pickle's own - `I close all dialogs`, `I take a screenshot`,
`def "..." field "..." is "..."` and the rest. Those belong to `Pickle.Vanilla` and are shared on
purpose.

## What stays manual

Shrunk on 2026-09-20: scenarios 5, 8, 9, 10 and 11 were automated as far as a running session can
take them, specifically so this table is short. What is left is here because the game genuinely
cannot be asked, not because nobody wrote it.

| docs/TESTING.md | Why |
| --- | --- |
| 0, the assembly-date line and the three patch-failure warnings | Already observed once, from `Player.log`; this suite does not re-check it |
| 1, the pawn creation screen | No step in this suite or its siblings reaches `Page_ConfigureStartingPawns`; see `03-passion-icons.feature`'s header comment |
| 1, whether an animation is actually moving | A single screenshot cannot show motion, only the frame it landed on. Two consecutive screenshots of an animated passion would prove it, and nothing stops that being written |
| 5's "live/triggered" for Alpha Skills' own ~20 HediffComp-driven passions | Forcing the real per-passion trigger condition (actual nudity, actual pain, ...) is out of scope; `03-passion-icons.feature` uses the always-full-colour `VSE_Natural` def as the closest honest stand-in - see `PassionSteps.cs`'s header comment |
| 8, a real restart, and loading an older save | One process cannot restart RimWorld. `08-settings-persistence.feature` covers the object → file → object round trip instead, which is the part that can actually break |
| 9, revealing and hiding the button in RIMMSQOL | Needs RIMMSQOL driven by hand. `09-mainbuttons-shortcut.feature` covers the rest: hidden by default, and the worker opens `Dialog_ModSettings` for this mod specifically |
| 10, the MainButtons shortcut's own label in French, and any pass at a larger UI scale | DefInjected does not re-resolve on a live language switch, so `10-french.feature` reaches the Keyed settings page but not the Def's text |

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
