# Shots meant for the Workshop page, not for verification. Nothing here asserts anything about
# the mod: every other feature in this suite does that. This one exists so the images do not have
# to be cropped by hand afterwards, and so the scene in them is chosen rather than borrowed.
#
# VALID ONLY IN THE MINIMAL PASS - no -DepsMap, the set the staging mounts by default. This is not
# a preference, it is what the images are for. Any third-party skill or work interface is free to
# redraw what is photographed here: Bio Tab+ draws its own character card and never reaches this
# mod's transpiler, and a third-party Work tab replacement shows none of these icons at all. A
# capture taken in a pass carrying those advertises someone else's interface on this mod's store
# page. @review says a person must look at the image; it does not say under which mod set the
# image is worth anything, so this paragraph does.
#
# Two techniques, both passed on by the Work Studio session on 2026-09-20.
#
# ONE: the interface is hidden. RimWorld's own screenshot mode draws only the windows that ask to
# be drawn, so the step raises that flag on the open windows, skips Pickle's own runner panel, and
# turns the mode on. What is left is the mod's window over the map - no tab bar, no colonist bar,
# no alerts, no dev tools, no runner. Every earlier publication image in Screenshots/ had to be
# cropped out of a 1920x1080 frame full of other mods' interface; these do not.
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
@review
Feature: shots for the Workshop page

  Background:
    Given the save "test-colony" is loaded
    And a colonist "Passionate" exists
    And SkillIcons settings are at their documented defaults
    And I close all dialogs

  Scenario: the Bio tab, with a passion set worth looking at
    Given SkillIcons sets "Passionate" skill "Shooting" passion to "Major"
    And SkillIcons sets "Passionate" skill "Melee" passion to "Minor"
    And SkillIcons sets "Passionate" skill "Construction" passion to "Major"
    And SkillIcons sets "Passionate" skill "Mining" passion to "Minor"
    And SkillIcons sets "Passionate" skill "Cooking" passion to "Major"
    And SkillIcons grants "Passionate" skill "Plants" the passion def "VSE_Natural"
    And SkillIcons sets "Passionate" skill "Medicine" passion to "Major"
    And SkillIcons sets "Passionate" skill "Intellectual" passion to "Minor"
    When SkillIcons opens the Bio tab for "Passionate"
    And SkillIcons hides the interface around the windows on screen
    And I take a screenshot "publication - bio tab"
    And SkillIcons brings the interface back

  Scenario: the settings page, uncluttered
    When I open the SkillIcons settings dialog
    And SkillIcons hides the interface around the windows on screen
    And I take a screenshot "publication - settings page"
    And SkillIcons brings the interface back
    And I close all dialogs
