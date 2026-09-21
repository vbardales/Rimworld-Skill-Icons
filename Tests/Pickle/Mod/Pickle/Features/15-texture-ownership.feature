# The one failure mode of this mod that every other check in this repository would miss, and the
# reason the avec-oracle pass exists at all.
#
# Oracle's Skill Icon Retextures ships eleven of the same texture paths as this mod - the vanilla
# and Vanilla Skills Expanded passions, plus RimWorld's own UI/Icons set. RimWorld resolves a path
# by walking the running mods and letting the LAST one win, which is why About.xml names Oracle in
# <loadAfter>. If that ordering ever stopped winning - a packageId renamed upstream, a load order a
# player rearranged, a loadAfter entry lost in an edit - nothing else here would go red. The icons
# would still be present, still animated, still the right shape in the right places. They would
# simply be Oracle's, on every screen, for every player who has both installed.
#
# So this asserts what the silence hides: which mod answers for a path. Not pixels - that would
# need readable textures and would only ever say "different", never "whose". It asks RimWorld's own
# content holders, the ones ContentFinder itself searches.
#
# RUN IT IN BOTH PASSES, and read the two results differently:
#
#   sans-facultatifs   the paths are uncontested, this mod answers trivially, and the first
#                      scenario is a tautology worth keeping - it fails if the textures stop
#                      shipping at all, which no other scenario catches either.
#   avec-oracle        the paths are contested and the claim becomes real. Run it there WITH
#                      16-texture-contest.feature, which proves the pass is what it says it is:
#                      an uncontested path there means Oracle is not actually staged, and this
#                      feature would pass for the wrong reason - the exact shape of false green
#                      this suite keeps turning up.
Feature: this mod wins the texture paths it shares with another icon set

  Scenario: the shared passion paths resolve to this mod
    Then SkillIcons owns the texture "Passions/PassionMajor"
    And SkillIcons owns the texture "Passions/PassionMinor"
    And SkillIcons owns the texture "Passions/PassionApathy"
    And SkillIcons owns the texture "Passions/PassionCritical"
    And SkillIcons owns the texture "Passions/PassionNatural"
    And SkillIcons owns the texture "UI/Icons/PassionMajor"
    And SkillIcons owns the texture "UI/Icons/PassionMinor"

