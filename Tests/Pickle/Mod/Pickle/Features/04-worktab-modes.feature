# docs/TESTING.md Scenario 3. Nothing is asserted about which pixels are grey versus coloured -
# only a person can judge that from the screenshot. Same Work tab reachability caveat as
# 03-passion-icons.feature; see that file's header comment.
@review
Feature: the three work tab modes

  Background:
    Given the save "test-colony" is loaded
    And a colonist "Modey" exists
    And "Modey" skill "Mining" passion is set to "Major"
    And "Modey" skill "Cooking" passion is set to "Minor"

  Scenario: screenshots of Colour, Greyed and Mixed
    When SkillIcons work tab mode is set to "colour"
    And I select "Modey"
    And I open the "Work" tab
    Then window "MainTabWindow_Work" is open
    When I wait 15 ticks
    And I take a screenshot "work tab mode colour"
    When SkillIcons work tab mode is set to "grey"
    And I wait 15 ticks
    And I take a screenshot "work tab mode grey"
    When SkillIcons work tab mode is set to "mixed"
    And I wait 15 ticks
    And I take a screenshot "work tab mode mixed"
