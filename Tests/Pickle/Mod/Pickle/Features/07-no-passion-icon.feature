# docs/TESTING.md Scenario 5. Two screenshots of the same pawn, the option off then on, so the
# judgement the scenario actually asks for - is the hollow heart visibly dimmer than a real
# passion's icon - can be made by comparing two images instead of from memory.
#
# The pawn is arranged so that comparison is possible at all: Shooting carries no passion, which
# is where the faint icon appears, and Cooking carries a Major one right below it, which is what
# it must not compete with. Without both in one frame there is nothing to judge against.
@review
Feature: the "no passion" icon is off by default and stays discreet when enabled

  Background:
    Given the save "test-colony" is loaded
    And a colonist "Passionate" exists
    And SkillIcons settings are at their documented defaults
    And I close all dialogs

  Scenario: nothing by default, a faint hollow heart once enabled
    Given "Passionate" skill "Shooting" passion is cleared
    And "Passionate" skill "Cooking" passion is set to "Major"
    Then SkillIcons setting "showNonePassion" reads "False"
    When I open the Bio tab for "Passionate"
    And I take a screenshot "no passion icon off"
    And SkillIcons "no passion" icon is turned "on"
    And I take a screenshot "no passion icon on"
    Then SkillIcons setting "showNonePassion" reads "True"
