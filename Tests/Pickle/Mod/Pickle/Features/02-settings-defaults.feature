# docs/TESTING.md Scenario 2. Nothing is asserted about the drawn layout itself: the report
# carries one screenshot of the settings window on a clean configuration, and a person compares it
# against the documented defaults - the same dictionary _tools/Run-Tests.ps1's own "a fresh
# SkillIconsSettings matches the documented defaults" test checks against the compiled DLL
# out of game. This scenario proves the same values reach the real window; it does not prove the
# field defaults themselves are right (Run-Tests.ps1 already does that).
#
# No tick wait anywhere in this scenario, and @watch on the Scenario line rather than the
# Feature line. Dialog_ModSettings force-pauses the game, so "I wait N ticks" can never advance
# and times out - seen twice, 2026-09-18 ("Step 'And I wait 10 ticks' timed out after 5s", with
# the run's own state dump reading paused=True while every tick wait in the other scenarios,
# which open no modal, passed). The first fix put @watch on the Feature line, where Pickle did
# not honour it; Pickle's own watch-steps.feature tags the Scenario. Rather than bet on that
# twice, the wait is gone entirely: the screenshot step is the deliverable and nothing it needs
# depends on the simulation advancing.
@review
Feature: the settings page on a clean configuration

  Background:
    Given the save "test-colony" is loaded

  @watch
  Scenario: screenshot of Dialog_ModSettings with nothing changed
    Given SkillIcons settings are at their documented defaults
    When I open the SkillIcons settings dialog
    And I take a screenshot "settings page defaults"
