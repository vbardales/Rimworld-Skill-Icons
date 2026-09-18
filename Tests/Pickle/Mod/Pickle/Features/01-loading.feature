# docs/TESTING.md scenario 0. No save needed: everything here is settled at the main menu.
#
# Deliberately narrow, and deliberately unchanged even now that Tests/Pickle/Source does exist
# (added later for Scenarios 1-5 and 7, see 02 through 06 in this folder and the README). This
# file only uses steps confirmed, by direct comparison against ArchitectStudio's and WorkStudio's
# own suites, to be Pickle's own generic vocabulary (Pickle.Vanilla) rather than a mod-specific
# custom step - `mod "..." is loaded`, `mod "..." loads after "..."` and
# `def "..." of type "..." exists` all appear verbatim, parameterized the same way, in both
# ArchitectStudio/Tests/Pickle and WorkStudio/Tests/Pickle. Scenario 0 needs nothing SkillIcons'
# own settings page or icon drawing does, so it stays on the generic vocabulary rather than
# pulling in the companion assembly for no reason.
Feature: SkillIcons loads after its dependencies and declares its settings shortcut

  Scenario: the mod loads after Harmony, Vanilla Skills Expanded and Alpha Skills
    Then mod "nelim.skillicons" is loaded
    And mod "nelim.skillicons" loads after "brrainz.harmony"
    And mod "nelim.skillicons" loads after "vanillaexpanded.skills"
    And mod "nelim.skillicons" loads after "sarg.alphaskills"

  Scenario: the hidden MainButtons settings shortcut is declared
    Then def "SkillIcons_Settings" of type "MainButtonDef" exists
