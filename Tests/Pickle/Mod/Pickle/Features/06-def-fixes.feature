# docs/TESTING.md Scenario 11, and the one scenario here that needs no screenshot and no custom
# step. These are changes to def FIELDS, so the loaded DefDatabase can be asked directly what it
# holds - stronger evidence than a photograph of a tooltip: a screenshot shows one state of one
# pawn, while these assertions read the values every tooltip is built from.
#
# Three of the original four Alpha Skills fixes are gone from here as of 2026-09-22: Sarg Bjornson
# fixed "nudist (active)"'s description, "pain-driven (active)"'s label, and "frozen"'s missing
# work tab icon upstream within a day of being told - the last two matching this mod's own values
# exactly. This mod's patches for them were retired rather than left to keep silently overwriting
# or duplicating his own fields (see Mod/1.6/Patches/AlphaSkills_Fixes.xml). What remains is not a
# fix at all: the two blindness tiers still share one icon upstream, which Sarg confirmed is his
# intentional design, and this mod keeps its own divergence anyway, for its own reason.
#
# _tools/Run-Tests.ps1 already replays both patch files out of game. This is not the same check:
# that one proves the XML transforms def nodes read off disk, this one proves the transformed
# values survived a real load, with every other installed mod also patching, in the order the
# player's own mod list produced.
#
# The "was patched by mod" steps matter as much as the values. Without them a fix could read
# correct because Alpha Skills repaired it upstream while this mod's patch silently stopped
# matching - the exact failure <success>Always</success> is designed to hide.
@review
Feature: the Alpha Skills and Vanilla Skills Expanded def fixes survived loading

  Scenario: the two blindness tiers keep this set's own distinct icons
    Then def "AS_BlindPassion_Sublime" field "iconPath" is "Passions/AS_BlindPassionSublime"
    And def "AS_BlindPassion_Sublime_Active" field "iconPath" is "Passions/AS_BlindPassionSublime_Active"
    And def "AS_BlindPassion_Sublime" was patched by mod "SkillIcons"

  Scenario: apathy has a work tab icon instead of an empty cell
    Then def "VSE_Apathy" field "workBoxIconPath" is "Passions/PassionApathy"
    And def "VSE_Apathy" was patched by mod "SkillIcons"
