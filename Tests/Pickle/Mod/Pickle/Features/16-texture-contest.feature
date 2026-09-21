# The companion to 15, and it belongs to ONE pass only:
#
#   scripts/Run-PickleWsl.ps1 -Mod SkillIcons -DepsMap wsl-deps.avec-oracle.map \
#       -Filter '15-texture-ownership.feature,16-texture-contest.feature'
#
# It is a separate file, named in the pass that wants it. A tag can select what a launch runs, but
# I found no way to make one exclude a scenario from a plain run, and a scenario that must not run
# in the minimal pass has to be kept out of it by something more certain than a tag whose
# exclusion I have not seen work. Note that a plain run of the whole suite still includes this
# file, and fails it: see docs/TESTING.md, "How many passes".
#
# What it is for: 15 claims this mod wins a contest. Run without Oracle staged, that claim passes
# because there is no contest at all - a green that means nothing, which is exactly the shape of
# false result this suite keeps turning up. This scenario makes the pass prove it is what it says
# it is before 15's claim is worth reading.
Feature: the texture contest in the avec-oracle pass is a real one

  Scenario: another icon set is actually loaded and claiming the same paths
    Then the texture "Passions/PassionMajor" is contested by at least 2 mods
    And the texture "UI/Icons/PassionMinor" is contested by at least 2 mods
