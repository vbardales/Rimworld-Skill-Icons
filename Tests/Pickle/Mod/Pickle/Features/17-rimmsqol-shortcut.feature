# MOD_SETTINGS.md, "Shortcut integration": in RIMMSQOL, reveal the shortcut, open the same settings, hide it
# again. 09-mainbuttons-shortcut.feature tests THIS mod's side of that contract by moving the def's buttonVisible
# by hand. This drives RIMMSQOL itself, through the shared steps of PickleTools/RimmsqolSteps, so that the answer
# to "can RIMMSQOL actually list and reveal SkillIcons' shortcut" no longer rests on reading its source:
#
#   - RIMMSQOL's own list of main buttons offers SkillIcons_Settings, and the entry a player would click reads hidden;
#   - RIMMSQOL reveals it (its own settings instance, its own write; the def's buttonVisible moves as a result),
#     the main bar then draws it, and the file RIMMSQOL wrote says so;
#   - the revealed button opens THIS mod's settings, the same dialog as Mod options;
#   - hiding it again empties the bar, and forgetting the choice leaves nothing in RIMMSQOL's file.
#
# What it does not do: click RIMMSQOL's checkbox. The steps call what the checkbox calls; whether the checkbox is
# wired to it is read from RIMMSQOL's source. And that RIMMSQOL keeps its choice across a restart is RIMMSQOL's
# behaviour, exercised by the restart chain of PickleTools' own demonstration and not repeated here.
#
# Played only by the pass avec-rimmsqol (wsl-deps.avec-rimmsqol.map). The requirement tags make a
# missing staged tool a skip rather than a false validation; the dedicated command below selects
# this feature. The screenshots are what shows pixels, and a green scenario says nothing about them.
@review @rimmsqol @requires:MalteSchulze.RIMMSqol @requires:nelim.pickletools.rimmsqol @requires:nelim.pickletools.interfacescale
Feature: RIMMSQOL reveals and hides the SkillIcons shortcut

  Background:
    Given the save "test-colony" is loaded
    And I close all dialogs
    Then mod "MalteSchulze.RIMMSqol" is loaded
    And RIMMSQOL is ready to be driven

  Scenario: RIMMSQOL's own list offers the shortcut, hidden, and the bar does not draw it
    Then RIMMSQOL's own list of main buttons offers "SkillIcons_Settings"
    And RIMMSQOL shows the main button "SkillIcons_Settings" as hidden
    And RIMMSQOL holds no choice for the main button "SkillIcons_Settings"
    And the main bar does not draw the button "SkillIcons_Settings"
    When RIMMSQOL's own window is opened on its list of main buttons
    Then RIMMSQOL's own window is open
    When I take a screenshot "rimmsqol, its list of main buttons, with the skillicons shortcut"
    And I close all dialogs

  Scenario: revealed in RIMMSQOL the shortcut is drawn, and it opens the same settings as Mod options
    When RIMMSQOL reveals the main button "SkillIcons_Settings"
    Then RIMMSQOL shows the main button "SkillIcons_Settings" as visible
    And RIMMSQOL's settings file records the main button "SkillIcons_Settings" as visible
    And the main bar draws the button "SkillIcons_Settings"
    When RIMMSQOL's own window is opened on the main button "SkillIcons_Settings"
    Then RIMMSQOL's own window is open
    When I take a screenshot "rimmsqol, edit page of the skillicons shortcut, revealed"
    And I close all dialogs
    And the main bar's button "SkillIcons_Settings" is activated
    Then SkillIcons sees a "Dialog_ModSettings" window open for mod "Skill Icons"
    When I take a screenshot "skillicons settings, opened by the shortcut RIMMSQOL revealed"
    And I close all dialogs

  Scenario: hidden again in RIMMSQOL the shortcut leaves the bar, and forgetting the choice leaves nothing behind
    Given RIMMSQOL reveals the main button "SkillIcons_Settings"
    And the main bar draws the button "SkillIcons_Settings"
    When RIMMSQOL hides the main button "SkillIcons_Settings"
    Then RIMMSQOL shows the main button "SkillIcons_Settings" as hidden
    And the main bar does not draw the button "SkillIcons_Settings"
    And RIMMSQOL's settings file records the main button "SkillIcons_Settings" as hidden
    When RIMMSQOL forgets its choice for the main button "SkillIcons_Settings"
    Then RIMMSQOL holds no choice for the main button "SkillIcons_Settings"
    And RIMMSQOL's settings file records no choice for the main button "SkillIcons_Settings"

  Scenario: the revealed shortcut remains usable at 150 percent interface scale
    Given Nelim's Pickle Tools: the interface scale is 150 percent
    When RIMMSQOL reveals the main button "SkillIcons_Settings"
    Then the main bar draws the button "SkillIcons_Settings"
    When the main bar's button "SkillIcons_Settings" is activated
    Then SkillIcons sees a "Dialog_ModSettings" window open for mod "Skill Icons"
    When I take a screenshot "skillicons settings, opened from RIMMSQOL at 150 percent scale"
    And I close all dialogs
