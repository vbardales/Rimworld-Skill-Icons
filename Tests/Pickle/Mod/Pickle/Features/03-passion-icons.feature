# docs/TESTING.md Scenarios 1 and 5. Nothing is asserted about colour, hue or animation - only a
# person can judge whether an icon "reads" as SkillIcons' own heart set versus Vanilla Skills
# Expanded's flame/star icons, or whether a single still screenshot's frame looks like it belongs
# to a moving sequence. Two of the three named places (Bio tab, Work tab) are attempted; the pawn
# creation screen is NOT - Pickle's own fixture drops the suite straight into "test-colony", an
# existing save, and no step anywhere in this suite or its siblings (ArchitectStudio, WorkStudio)
# reaches Page_ConfigureStartingPawns from there. Forcing that flow would need scenario setup
# unlike anything already established in this repository's Pickle suites, so it is left manual -
# see the README's "What stays manual" table.
#
# The passion mix covers: a skill with no passion at all (Scenario 5's default-off case), a skill
# at vanilla Minor, a skill at vanilla Major - the one axis every install has regardless of mods -
# and a skill granted the real, installed PassionDef "VSE_Natural" (isTriggered == false,
# learnRateFactor > 1 - the "always full-colour" bucket PassionIconAnimations.EnCouleur() itself
# uses for Mixed mode). That last one is the closest honest stand-in for "live": forcing the true
# triggered/dormant split of Alpha Skills' own ~20 HediffComp-driven passions (nudist active only
# while actually nude, and so on) would need faking each one's specific real-world condition,
# which is out of scope here - see PassionSteps.cs's own header comment for the full reasoning.
#
# Whether "I open the \"Work\" tab" reaches RimWorld's own MainTabWindow_Work, or a third-party
# Work tab replacement on her modlist, is UNCONFIRMED (docs/TESTING.md Scenario 1's own log,
# 2026-09-18, records a third-party Work tab replacement that drew no SkillIcons icon at all in
# earlier observation). The scenario asserts window "MainTabWindow_Work" is open before
# screenshotting it, on purpose: if her modlist routes elsewhere, this scenario fails loudly here
# instead of silently screenshotting the wrong window and calling it covered.
@review
Feature: passion icons in the Bio tab and the Work tab

  Background:
    Given the save "test-colony" is loaded
    And a colonist "Passionate" exists

  Scenario: screenshots of a mixed passion set in the Bio tab and the Work tab
    Given "Passionate" skill "Shooting" passion is cleared
    And "Passionate" skill "Mining" passion is set to "Minor"
    And "Passionate" skill "Cooking" passion is set to "Major"
    And "Passionate" skill "Plants" is granted the passion def "VSE_Natural"
    # Her first real run (2026-09-18) captured this screenshot with a RimLogging log-viewer window
    # covering the whole screen, left open from an earlier scenario in the same run. Close
    # everything first so the Bio tab is actually what gets screenshotted.
    And I close all dialogs
    When I open the Bio tab for "Passionate"
    And I wait 30 ticks
    And I take a screenshot "bio tab mixed passions"
    And I close all dialogs
    And I select "Passionate"
    And I open the "Work" tab
    Then window "MainTabWindow_Work" is open
    When I wait 30 ticks
    And I take a screenshot "work tab mixed passions"
