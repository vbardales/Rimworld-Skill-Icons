# docs/TESTING.md Scenario 8, second of two passes. Run 12 first, in its own process, then this.
#
# NO "settings are at their documented defaults" in the Background, and that omission IS the
# scenario: this pass must read what the previous process left on disk and loaded at startup, not
# what a reset would put there. It is only possible because SettingsSandbox no longer resets in its
# [BeforeScenario] - nine features say it themselves, so the hook was making implicit something
# already explicit, and a sandbox that does two things cannot be stood down for one of them.
#
# What this proves that 08 does not: 08 writes, reads the file, and re-reads through the game's own
# ReadModSettings, all inside one process. This proves the settings object a NEW process builds at
# startup carries them - which is what a player means by "they survived a restart".
#
# The last two steps put the defaults back and keep THAT, so the install is left clean rather than
# in grey mode with animations off. Without the keep step the teardown would restore this pass's
# own backup, which by then holds the test values rather than hers.
Feature: settings read back in the next process

  Scenario: the new process starts with what the old one wrote
    Then SkillIcons setting "workTabMode" reads "1"
    And SkillIcons setting "workTabScale" reads "1.7"
    And SkillIcons setting "enabled" reads "False"
    When SkillIcons settings are at their documented defaults
    And SkillIcons settings are written to disk
    And SkillIcons settings are kept for the next process
