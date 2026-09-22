# docs/TESTING.md Scenario 8, as far as one process can take it. These settings are global rather
# than per-save, so what has to survive is the object -> file -> object round trip, and that is
# what this asserts: values written, found in the file on disk by name, then read back into a
# fresh object through the game's own ReadModSettings.
#
# It does NOT restart RimWorld. One process cannot; `12-restart-write.feature` and
# `13-restart-read.feature` cover the real two-process restart, including loading the existing
# `test-colony` save after the settings were restored in the new process. No manual follow-up is
# left for this behavior.
#
# No @review tag and no screenshot: every assertion here is a value comparison, so nothing needs
# a person to look at it.
Feature: settings survive the trip to disk and back

  Background:
    Given the save "test-colony" is loaded
    And SkillIcons settings are at their documented defaults

  Scenario: changed values reach the file and come back from it
    When SkillIcons work tab mode is set to "grey"
    And SkillIcons work tab icon size is set to 170 percent
    And SkillIcons animated passion icons is turned "off"
    And SkillIcons settings are written to disk
    Then the SkillIcons settings file records "workTabMode" as "1"
    And the SkillIcons settings file records "enabled" as "False"
    When SkillIcons settings are re-read from disk
    Then SkillIcons setting "workTabMode" reads "1"
    And SkillIcons setting "workTabScale" reads "1.7"
    And SkillIcons setting "enabled" reads "False"
