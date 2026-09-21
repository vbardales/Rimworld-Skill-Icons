# docs/TESTING.md Scenario 1, the last leg that used to need a person watching a screen for five
# seconds - and therefore the one most likely to be skipped on a suite green everywhere else. A
# silently frozen animation is exactly the defect that would then ship: the icons would still be
# the right ones, in the right places, in the right colours, and simply not move.
#
# This does not photograph anything. It asks the mod the same question the game asks it while
# drawing - what texture does this passion show right now - twice, a known number of frames apart.
# PassionIconAnimations picks its frame from Time.realtimeSinceStartup, so frames advance in real
# time and waiting frames is enough; going through PassionDef.Icon rather than the mod's own cache
# means a transpiler that stopped applying fails here too.
#
# The second scenario is not decoration. "The texture changed" on its own does not distinguish an
# animation running from something else changing, so a passion with no animation is put through
# exactly the same treatment and must NOT change. Without it the first scenario proves nothing.
#
# AS_DrunkenPassion_Active and VSE_Apathy are keys of PassionIconAnimations.Specs;
# AS_BlindPassion_Elevated and AS_NudistPassion are not. If that table changes, these four defNames
# are the first thing to re-check - a count that drifts falls a passion back to its static icon
# with no error, which is the failure the table's own comment warns about.
Feature: the animated passions actually animate

  Background:
    Given SkillIcons settings are at their documented defaults

  Scenario: an animated passion draws a different frame a moment later
    Then SkillIcons passion "AS_DrunkenPassion_Active" shows a different frame after 30 frames
    And SkillIcons passion "VSE_Apathy" shows a different frame after 30 frames

  Scenario: a passion with no animation draws the same frame
    Then SkillIcons passion "AS_BlindPassion_Elevated" shows the same frame after 30 frames
    And SkillIcons passion "AS_NudistPassion" shows the same frame after 30 frames
