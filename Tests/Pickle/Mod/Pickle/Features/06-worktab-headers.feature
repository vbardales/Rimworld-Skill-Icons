# docs/TESTING.md Scenario 7. The icon-only mode's tooltip claim (naming the work type and its
# description) is NOT asserted here: Pickle has no hover/tooltip primitive anywhere in its own
# sample features (checked across every .feature file shipped with Pickle Workshop 3791648678
# while writing this suite - stat-steps, def-steps, ui-steps and the rest all confirm there is
# no generic "hover" or "tooltip reads" step). A person reading the icon-only screenshot can at
# least see the narrowed column and the icon itself; the tooltip text stays manual - this is also
# why docs/TESTING.md Scenario 11 (the five tooltip fixes) is not attempted anywhere in this suite.
@review
Feature: work tab column header modes

  Background:
    Given the save "test-colony" is loaded
    And a colonist "Headery" exists
    And "Headery" skill "Mining" passion is set to "Major"

  Scenario: screenshots of icon-and-label, icon-only and label-only
    When SkillIcons work tab header mode is set to "icon and label"
    And I select "Headery"
    And I open the "Work" tab
    Then window "MainTabWindow_Work" is open
    When I wait 15 ticks
    And I take a screenshot "work tab headers icon and label"
    When SkillIcons work tab header mode is set to "icon only"
    And I wait 15 ticks
    And I take a screenshot "work tab headers icon only"
    When SkillIcons work tab header mode is set to "label only"
    And I wait 15 ticks
    And I take a screenshot "work tab headers label only"
