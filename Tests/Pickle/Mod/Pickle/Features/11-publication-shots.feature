# Shots meant for the Workshop page, not for verification. Nothing here asserts anything about
# the mod: every other feature in this suite does that. This one exists so the images do not have
# to be cropped by hand afterwards, and so the scene in them is chosen rather than borrowed.
#
# VALID ONLY IN THE STUDIO PASS - wsl-deps.studio.map stages PickleTools' ScreenshotStudio and
# ClearScreen companions, and this feature loads the packaged zen meadow fixture. This is not a
# preference, it is what the images are for. Any third-party skill or work interface is free to
# redraw what is photographed here: Bio Tab+ draws its own character card and never reaches this
# mod's transpiler, and a third-party Work tab replacement shows none of these icons at all. A
# capture taken in a pass carrying those advertises someone else's interface on this mod's store
# page. @review says a person must look at the image; it does not say under which mod set the
# image is worth anything, so this paragraph does.
#
# Two techniques, both passed on by the Work Studio session on 2026-09-20.
#
# ONE: the interface is hidden for the settings window. RimWorld's own screenshot mode draws only
# windows that ask to be drawn, so the step leaves the mod's settings over the map and removes the
# HUD and Pickle runner. The Bio tab is an InspectTab rather than a Window and disappears in that
# mode, so its scenario deliberately keeps the normal interface: the visible tab is the subject.
#
# TWO: the scene is staged. A publication shot that borrows whatever the save happens to hold
# photographs someone else's content - Work Studio's editor shot caught a defName from an
# unrelated mod, which reads as debug output on a store page. So this scenario builds the passion
# mix it wants: eight skills, eight different passions, spread across hues and across the
# live/dormant divide, rather than the sparse set the test fixture ships with.
#
# The interface is brought back explicitly at the end, and again from [AfterScenario] in case a
# step throws in between. Without that, a scenario dying here would leave every later scenario in
# the run photographing a screen with no interface on it.
# The scenario deliberately frames the studio's "zen" preset before opening either window. The
# map is presentation-only: functional scenarios keep test-colony and their original preconditions.
@review @requires:nelim.pickletools.screenshotstudio @requires:nelim.pickletools.clearscreen
Feature: shots for the Workshop page

  Background:
    Given the save "nelim-zen-meadow-studio" is loaded
    And game speed is paused
    And a colonist "Miel" exists
    And SkillIcons settings are at their documented defaults
    And I close all dialogs
    And Nelim's Pickle Tools: I frame the studio "zen"

  Scenario: the Bio tab, with a passion set worth looking at
    Given SkillIcons sets "Miel" skill "Shooting" passion to "Major"
    And SkillIcons sets "Miel" skill "Melee" passion to "Minor"
    And SkillIcons sets "Miel" skill "Construction" passion to "Major"
    And SkillIcons sets "Miel" skill "Mining" passion to "Minor"
    And SkillIcons sets "Miel" skill "Cooking" passion to "Major"
    And SkillIcons grants "Miel" skill "Plants" the passion def "VSE_Natural"
    And SkillIcons sets "Miel" skill "Medicine" passion to "Major"
    And SkillIcons sets "Miel" skill "Intellectual" passion to "Minor"
    When SkillIcons opens the Bio tab for "Miel"
    And I take a screenshot "publication - bio tab"

  Scenario: the settings page, uncluttered
    When I open the SkillIcons settings dialog
    And SkillIcons hides the interface around the windows on screen
    And I take a screenshot "publication - settings page"
    And SkillIcons brings the interface back
    And I close all dialogs
