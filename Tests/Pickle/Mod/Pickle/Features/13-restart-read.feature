# docs/TESTING.md Scenario 8, second of two passes. Run 12 first, in its OWN launch, then this.
#
# NO "settings are at their documented defaults" in the Background, and that omission IS the
# scenario: this pass must read what the previous process left on disk and loaded at startup, not
# what a reset would put there. It is only possible because SettingsSandbox no longer resets in its
# [BeforeScenario] - nine features say it themselves, so the hook was making implicit something
# already explicit, and a sandbox that does two things cannot be stood down for one of them.
#
# What this proves that 08 does not: 08 writes, reads the file, and re-reads through the game's own
# ReadModSettings, all inside one process. This proves the settings object a NEW process builds at
# startup carries them. It then loads the supplied, pre-existing `test-colony` save and reads the
# same values again, proving the global settings were not replaced by save state.
#
# The first step refuses to pass when the writer ran in the SAME process. That is a restart test
# that never restarted: the in-memory object would still hold the values and every assertion below
# would be true for the wrong reason. It also means this feature cannot ride along in a plain run
# of the whole suite, where 12 and 13 share a process - it is launched by name, as the second of
# two launches.
#
# Leaving the install clean is the sandbox's job, not this scenario's: the reader step consumes
# the marker and the backup, the defaults written below stay on disk, and if this pass never comes
# at all the next scenario to run in a later process finds the orphaned keep and puts the file
# back (SettingsSandbox.DiscardOrphanedKeep).
Feature: settings read back in the next process

  Scenario: the new process starts with what the old one wrote
    Given SkillIcons reads what the previous process kept
    Then SkillIcons setting "workTabMode" reads "1"
    And SkillIcons setting "workTabScale" reads "1.7"
    And SkillIcons setting "enabled" reads "False"
    When the save "test-colony" is loaded
    Then SkillIcons setting "workTabMode" reads "1"
    And SkillIcons setting "workTabScale" reads "1.7"
    And SkillIcons setting "enabled" reads "False"
    When SkillIcons settings are at their documented defaults
    And SkillIcons settings are written to disk
