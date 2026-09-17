# In-game scenarios, run by Pickle

Two of [docs/TESTING.md](../../docs/TESTING.md)'s twelve scenarios, written in Gherkin and played
inside a running RimWorld by [Pickle](https://github.com/RimWorks/Rimworld-Pickle)
(`rimworks.pickle`, Workshop 3791648678).

`Mod/` is a companion mod, **SkillIcons - Pickle tests**, never published. It holds the one
feature file, so nothing test-related ships in the Workshop folder.

## Setup, once

1. Subscribe to Pickle and RimLogging, and enable both.
2. Link both this repository's `Mod/` and the companion mod into RimWorld's `Mods` folder. A
   junction needs no elevation:

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
every step that needs one fails. Disable Concord for the run - though neither scenario here uses
one; see below.

## Build

None needed. Both scenarios use only Pickle's own generic step vocabulary (`Pickle.Vanilla`) -
`mod "..." is loaded`, `mod "..." loads after "..."`, `def "..." of type "..." exists` - so there
is no companion steps assembly to compile, unlike ArchitectStudio's and WorkStudio's suites.
Feature files need no build either way.

## Run

- **In game**: dev mode on, debug actions menu, *Pickle*. Tick the SkillIcons suite, *Run selected*.
- **Unattended**: `RimWorldWin64.exe "-pickle-run=SkillIcons - Pickle tests"`. The filter is the
  companion mod's name, exactly; without it Pickle also runs its own sample features. Reports land
  in `PickleReports` beside the saves: `report.html`, `junit.xml`, `summary.md`.

Neither scenario touches a save, a colony or a button - both read state already present at the
main menu (load order, the def database), so there is nothing to reset or restore afterward.

## What stays manual

Everything else. These two scenarios only prove the mod loaded in the right order and declared
its hidden settings shortcut - they cannot see a colour, an animation, a slider's effect or a
tooltip's text. The other eleven `docs/TESTING.md` scenarios, and the rest of scenario 0 (the
assembly-date log line, the three patch-failure warnings), need a person watching the screen; see
the feature file's own header comment for why no custom steps assembly was built to close that
gap for a settings page with no custom-drawn or draggable interaction.
