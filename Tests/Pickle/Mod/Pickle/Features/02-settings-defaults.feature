# docs/TESTING.md Scenario 2. Nothing is asserted about the drawn layout itself: the report
# carries one screenshot of the settings window on a clean configuration, and a person compares it
# against the documented defaults - the same dictionary _tools/Run-Tests.ps1's own "a fresh
# SkillIconsSettings matches the documented defaults" test checks against the compiled DLL
# out of game. This scenario proves the same values reach the real window; it does not prove the
# field defaults themselves are right (Run-Tests.ps1 already does that).
#
# @watch, not a plain tick wait: Dialog_ModSettings is a full-screen modal that pauses the
# simulation, so "I wait N ticks" never advances and times out - confirmed 2026-09-18, her first
# real run ("Step 'And I wait 10 ticks' timed out after 5s"). Pickle's own watch-steps.feature
# documents @watch for exactly this: real wall-clock time instead of driving sim ticks.
@review @watch
Feature: the settings page on a clean configuration

  Background:
    Given the save "test-colony" is loaded

  Scenario: screenshot of Dialog_ModSettings with nothing changed
    Given SkillIcons settings are at their documented defaults
    When I open the SkillIcons settings dialog
    And I wait 10 ticks
    And I take a screenshot "settings page defaults"
