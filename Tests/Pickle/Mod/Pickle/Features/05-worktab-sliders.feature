# docs/TESTING.md Scenario 4. Minimum, maximum and default (reverted) size and opacity; nothing is
# asserted about the visible size or fade, only a person can judge that. The reverted screenshot
# lets a person compare it against 02-settings-defaults.feature's own screenshot, the same
# comparison Scenario 4's "Fails if" clause asks for. Same Work tab reachability caveat as
# 03-passion-icons.feature; see that file's header comment.
@review
Feature: work tab icon size and opacity sliders

  Background:
    Given the save "test-colony" is loaded
    And a colonist "Slidey" exists
    And SkillIcons sets "Slidey" skill "Mining" passion to "Major"

  Scenario: screenshots at default, minimum, maximum, then reverted to default
    Given SkillIcons settings are at their documented defaults
    When I select "Slidey"
    And I open the "Work" tab
    Then window "MainTabWindow_Work" is open
    When I wait 15 ticks
    And I take a screenshot "work tab sliders default"
    When SkillIcons work tab icon size is set to 100 percent
    And SkillIcons work tab icon opacity is set to 25 percent
    And I wait 15 ticks
    And I take a screenshot "work tab sliders minimum"
    When SkillIcons work tab icon size is set to 180 percent
    And SkillIcons work tab icon opacity is set to 100 percent
    And I wait 15 ticks
    And I take a screenshot "work tab sliders maximum"
    When SkillIcons work tab icon size is set to 130 percent
    And SkillIcons work tab icon opacity is set to 85 percent
    And I wait 15 ticks
    And I take a screenshot "work tab sliders reverted"
