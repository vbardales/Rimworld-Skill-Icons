# docs/TESTING.md Scenario 10, the half a running session can settle - but not the way it was
# written first, and the correction is worth more than the scenario.
#
# It used to switch the language mid-run with SelectLanguage, and it failed three times before
# saying why. Changing language makes RimWorld clear and reload every def, which pulls the game
# out from under the runner: the log filled with "Root level exception in Update()" and
# Find.WorldObjects returning null, while the scenario waited thirty-five seconds for a language
# that was never going to arrive. Two other explanations were believed on the way there - a five
# second step timeout, then Pickle's own dashboard throwing during the switch. Both were real, and
# both were veils over this.
#
# So the language is not changed here at all. It is chosen at launch, by
# scripts/Run-PickleWsl.ps1 -Language, and this feature asserts against whatever language the game
# is actually running. That means two passes to cover both:
#
#   Run-PickleWsl.ps1 -Mod SkillIcons
#   Run-PickleWsl.ps1 -Mod SkillIcons -Language French
#
# The French one is the one that matters, and it needs looking at rather than counting: in
# developer mode - which every Pickle run is - a key missing from the active language does not
# fall back to plain English, it comes out accented letter by letter (a -> à, c -> ç, n -> ƞ).
# So accented gibberish means a missing key, while clean English in a French interface means a
# literal that never went through Translate. The assertions below catch the first; only the
# screenshot catches the second.
#
# The MainButtons shortcut's own description is DefInjected rather than Keyed, and is asserted in
# 09-mainbuttons-shortcut.feature instead: a launch that chooses its language switches nothing, so
# the def is injected at startup and readable. It was listed here as unreachable until 2026-09-21,
# which was true of a mid-run switch and not of a launch that starts in the language.
@review
Feature: the settings page in the language the game runs in

  Background:
    Given SkillIcons settings are at their documented defaults
    And I close all dialogs

  Scenario: no control reads as a raw key, whatever language this pass runs in
    Then SkillIcons translation key "SkillIcons.Animated" does not read as a raw key
    And SkillIcons translation key "SkillIcons.WorkTab" does not read as a raw key
    And SkillIcons translation key "SkillIcons.GalleryHint" does not read as a raw key
    When I open the SkillIcons settings dialog
    And I take a screenshot "settings page, as this pass runs it"
    And I close all dialogs
