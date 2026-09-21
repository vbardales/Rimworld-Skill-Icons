# docs/TESTING.md Scenario 8, the half that needs a real restart - first of two passes, and the
# reason it took three attempts to write.
#
# One process cannot restart itself, which is why this stayed manual while the suite ran inside her
# own game. Every Run-PickleWsl.ps1 launch is a new process, so the restart costs a second pass and
# nothing else. What it also costs is standing down the sandbox: SettingsSandbox restores the
# settings file in [AfterScenario], so anything a scenario writes is normally undone as it ends -
# which is exactly the protection that stops a run leaving her sliders where a test put them.
#
# The last line of the Background is that stand-down, and it is a STEP rather than a tag on
# purpose. Pickle collects hooks with an additive tag filter, in GetMethods order, so a tagged hook
# can neither silence the general one nor be relied on to run before it. Steps always run between
# the before-hooks and the after-hooks. It is also written where it matters: whoever reads this
# feature sees that it keeps its file, which a launcher flag would never have shown them.
Feature: settings written in one process

  Background:
    Given SkillIcons settings are at their documented defaults
    And SkillIcons settings are kept for the next process

  Scenario: values are changed and committed to disk
    When SkillIcons work tab mode is set to "grey"
    And SkillIcons work tab icon size is set to 170 percent
    And SkillIcons animated passion icons is turned "off"
    And SkillIcons settings are written to disk
    Then the SkillIcons settings file records "workTabMode" as "1"
    And the SkillIcons settings file records "enabled" as "False"
