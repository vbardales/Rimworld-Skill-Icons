# docs/TESTING.md Scenario 9, minus the part that needs RIMMSQOL.
#
# What this settles: the def is hidden on a clean configuration, and activating its worker - which
# is what a revealed button ends up calling - opens Dialog_ModSettings for THIS mod rather than
# merely some settings window. That last check is the whole point: the scenario's real question is
# whether the shortcut and the Options entry lead to the same place, and a dialog opened for
# another mod would look identical in a screenshot.
#
# `17-rimmsqol-shortcut.feature` covers RIMMSQOL's own list, reveal, hide and settings-file
# lifecycle with PickleTools/RimmsqolSteps in its dedicated optional pass. This minimal-pass
# feature therefore covers only the mod-owned shortcut contract.
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

  # The claim docs/TESTING.md makes about this shortcut is not "it opens a settings window" but
  # "it opens the SAME settings as Options": a change made through one is visible through the
  # other. The out-of-game harness proves the IL calls LoadedModManager.GetMod<SkillIconsMod>(),
  # so both paths reach one mod instance; this proves the consequence on screen, which is what a
  # player would notice if it were ever false.
  #
  # RIMMSQOL's own workflow is in 17-rimmsqol-shortcut.feature, staged only in its dedicated
  # optional pass. This scenario remains minimal so it proves the mod-owned route independently.
  Scenario: a change made through the shortcut is there through Mod options
    Given SkillIcons settings are at their documented defaults
    When SkillIcons activates the MainButtonDef "SkillIcons_Settings"
    Then SkillIcons sees a "Dialog_ModSettings" window open for mod "SkillIcons"
    When SkillIcons work tab mode is set to "grey"
    And SkillIcons work tab icon size is set to 170 percent
    And I close all dialogs
    When I open the SkillIcons settings dialog
    Then SkillIcons setting "workTabMode" reads "1"
    And SkillIcons setting "workTabScale" reads "1.7"
    When I close all dialogs
    And SkillIcons settings are at their documented defaults

  # docs/TESTING.md's reveal-and-hide, minus RIMMSQOL. What RIMMSQOL does when a player reveals
  # this button is move MainButtonDef.buttonVisible; what this mod owes is the other side of that
  # contract - invisible until something moves it, then properly drawn rather than refused or
  # greyed. So the field is moved directly, which is the same field RIMMSQOL moves, and the bar's
  # own worker is asked what it would do.
  #
  # RIMMSQOL's interface and persistence are driven by the shared PickleTools companion in
  # 17-rimmsqol-shortcut.feature. Keeping that dependency out of this feature preserves the
  # minimal pass as a check of the mod-owned side of the contract.
  # The two screenshots are the point of the @review tag on this feature: the bar as it draws itself
  # with the button hidden and then revealed, which is the image someone asks for when they want to
  # see what a customization mod would give the player. Nothing here is RIMMSQOL - the same field
  # is moved directly - but the bar is the real one, so the picture is what RIMMSQOL would cause.
  # The bar sits at the bottom of the frame; the button comes last, at order 990.
  Scenario: revealed it is drawn and live, hidden it is gone again
    Then SkillIcons MainButtonDef "SkillIcons_Settings" is not drawn in the bar
    When I take a screenshot "main button bar, shortcut hidden"
    And SkillIcons reveals the MainButtonDef "SkillIcons_Settings", as a customization mod would
    Then SkillIcons MainButtonDef "SkillIcons_Settings" is drawn in the bar
    When I take a screenshot "main button bar, shortcut revealed"
    And SkillIcons hides the MainButtonDef "SkillIcons_Settings" again
    Then SkillIcons MainButtonDef "SkillIcons_Settings" is not drawn in the bar

  # Was listed as unreachable because DefInjected does not re-resolve when the language is switched
  # mid-run. A launch that CHOOSES its language switches nothing: the def is injected at startup, so
  # the description is readable here. Run this feature once per language (-Language French).
  Scenario: the description is the one for the language this pass runs in
    Then SkillIcons MainButtonDef "SkillIcons_Settings" carries its description for the active language
