# docs/TESTING.md Scenario 10, the half a running session can settle.
#
# Keyed text re-resolves the moment the language changes, and the settings page is made of Keyed
# text, so the screenshot taken here really is the French page: raw keys, empty controls and
# clipped labels are all visible in it. DefInjected does NOT re-resolve without a def reload, so
# the MainButtons shortcut's own label and description are out of reach here and stay manual, as
# does the same pass at a larger UI scale.
#
# The language is put back to English before the scenario ends. Pickle runs every scenario in one
# session, so leaving it in French would not fail here - it would fail somewhere later, for no
# apparent reason.
#
# @watch because switching language and reloading its data is wall-clock work that does not
# advance a game tick, the same reason 02 carries the tag.
@review @watch
Feature: the settings page in French

  Background:
    Given the save "test-colony" is loaded
    And SkillIcons settings are at their documented defaults
    And I close all dialogs

  Scenario: every control reads as French, and English comes back afterwards
    When SkillIcons sets the game language to "French"
    Then SkillIcons translation key "SkillIcons.Animated" does not read as a raw key
    And SkillIcons translation key "SkillIcons.WorkTab" does not read as a raw key
    And SkillIcons translation key "SkillIcons.GalleryHint" does not read as a raw key
    When I open the SkillIcons settings dialog
    And I take a screenshot "settings page in French"
    And I close all dialogs
    And SkillIcons sets the game language to "English"
    Then SkillIcons translation key "SkillIcons.Animated" does not read as a raw key
