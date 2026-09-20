# docs/TESTING.md Scenario 9, minus the part that needs RIMMSQOL.
#
# What this settles: the def is hidden on a clean configuration, and activating its worker - which
# is what a revealed button ends up calling - opens Dialog_ModSettings for THIS mod rather than
# merely some settings window. That last check is the whole point: the scenario's real question is
# whether the shortcut and the Options entry lead to the same place, and a dialog opened for
# another mod would look identical in a screenshot.
#
# What stays manual: revealing the button in RIMMSQOL, hiding it again, and confirming that choice
# survives a restart. Nothing here installs or drives RIMMSQOL.
@review
Feature: the hidden MainButtons shortcut opens this mod's own settings

  Background:
    Given the save "test-colony" is loaded
    And I close all dialogs

  Scenario: hidden by default, and opens the same dialog when activated
    Then def "SkillIcons_Settings" of type "MainButtonDef" exists
    And SkillIcons MainButtonDef "SkillIcons_Settings" is hidden on a clean configuration
    When SkillIcons activates the MainButtonDef "SkillIcons_Settings"
    Then SkillIcons sees a "Dialog_ModSettings" window open for mod "SkillIcons"
    When I take a screenshot "settings opened by the MainButtons shortcut"
    And I close all dialogs
