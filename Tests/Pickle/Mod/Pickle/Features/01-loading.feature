# docs/TESTING.md scenario 0. No save needed: everything here is settled at the main menu.
#
# Deliberately narrow. ArchitectStudio and WorkStudio's suites lean on custom steps compiled
# into a companion mod (a "nelim.<mod>.pickletests" project referencing RimWorks.Pickle.Ref) to
# reach into their own draggable, custom-drawn UI. SkillIcons has no interaction of that shape:
# its settings page is Listing_Standard checkboxes, sliders and radio buttons, and its own
# behavior (which icon set gets drawn, whether it animates, whether a def field changed) is what
# docs/TESTING.md and _tools/Run-Tests.ps1 already cover, in prose and out of the game
# respectively. This file only uses steps confirmed, by direct comparison against both existing
# suites, to be Pickle's own generic vocabulary (Pickle.Vanilla) rather than a mod-specific
# custom step - `mod "..." is loaded`, `mod "..." loads after "..."` and
# `def "..." of type "..." exists` all appear verbatim, parameterized the same way, in both
# ArchitectStudio/Tests/Pickle and WorkStudio/Tests/Pickle. No companion steps DLL exists for
# SkillIcons, and none was built for this pass: written, never run, exactly like those two
# suites were on the day they were written.
Feature: SkillIcons loads after its dependencies and declares its settings shortcut

  Scenario: the mod loads after Harmony, Vanilla Skills Expanded and Alpha Skills
    Then mod "nelim.skillicons" is loaded
    And mod "nelim.skillicons" loads after "brrainz.harmony"
    And mod "nelim.skillicons" loads after "vanillaexpanded.skills"
    And mod "nelim.skillicons" loads after "sarg.alphaskills"

  Scenario: the hidden MainButtons settings shortcut is declared
    Then def "SkillIcons_Settings" of type "MainButtonDef" exists
