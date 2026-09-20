# docs/TESTING.md Scenario 11, and the one scenario here that needs no screenshot and no custom
# step. The five fixes are changes to def FIELDS, so the loaded DefDatabase can be asked directly
# what it holds - stronger evidence than a photograph of a tooltip: a screenshot shows one state
# of one pawn, while these assertions read the values every tooltip is built from.
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

  Scenario: nudist (active) no longer carries the nomadic description
    Then def "AS_NudistPassion_Active" of type "PassionDef" exists
    And def "AS_NudistPassion_Active" field "description" is "This person will learn this skill much faster, but only when nude. They are nude right now."
    And def "AS_NudistPassion_Active" was patched by mod "SkillIcons"

  Scenario: pain-driven (active) is distinguishable from its dormant state
    Then def "AS_PainDrivenPassion_Active" field "label" is "pain-driven (active)"
    And def "AS_PainDrivenPassion_Active" was patched by mod "SkillIcons"

  Scenario: frozen has a work tab icon instead of an empty cell
    Then def "AS_FrozenPassion" field "workBoxIconPath" is "Passions/AS_FrozenPassionGrey"
    And def "AS_FrozenPassion" was patched by mod "SkillIcons"

  Scenario: the two blindness tiers no longer share one icon
    Then def "AS_BlindPassion_Sublime" field "iconPath" is "Passions/AS_BlindPassionSublime"
    And def "AS_BlindPassion_Sublime_Active" field "iconPath" is "Passions/AS_BlindPassionSublime_Active"
    And def "AS_BlindPassion_Sublime" was patched by mod "SkillIcons"

  Scenario: apathy has a work tab icon instead of an empty cell
    Then def "VSE_Apathy" field "workBoxIconPath" is "Passions/PassionApathy"
    And def "VSE_Apathy" was patched by mod "SkillIcons"
