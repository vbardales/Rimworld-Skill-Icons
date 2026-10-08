# Pictures for the Workshop gallery, for a person to look at and keep: nothing is asserted, every scenario is @review. This feature
# replaced the zen-studio shots of 2026-09-22; it runs only in the pass `sanctuary` (wsl-deps.sanctuary.map), on the Sanctuary of
# Nelim (SanctuaryBacklot, save Nelims-tribe). Skill Icons draws windows, so the rule of PUBLISHING.md applies: a window is a
# capture of what it is and is not dressed, but a window that covers the map is taken over a backdrop chosen on purpose.
#
# The story: Nelim, the only colonist of the Sanctuary, has been given a mod that redraws every passion. Over a morning she sits in
# the salon of her house and reads what her skills are worth (the Bio tab), opens the work tab to see who should do what (the three
# modes), and opens the mod's settings to make it look the way she likes (the page, tall, on the bamboo backdrop).
#
# The places were chosen from the descriptions of every named place in docs/SANCTUAIRE-LIEUX.md (the empty photographs they refer
# to are not on this machine, so the choice is on the text, to be confirmed by the captures themselves):
#   - Bio tab: `sofa-corner`, the pink-carpet lounge of the house. The tab covers the left of the screen, the right stays visible: a
#     cosy interior where the story begins, with Nelim's own rug and sofas.
#   - Work tab: `window-backdrop-for-width`. The tab is a wide window with little height: two bamboo smileys show in the top corners.
#   - Settings page: `window-backdrop-for-height`. The page is a tall window (about 900 x 700 px): the bamboo backdrop, cropped later.
#   Rejected: `hearth-hall` (big, the two thrumbos stand in it), `water-garden` and `left-bank` (pretty, but windows hide them and
#   a pond behind a form says nothing), `exhibition-zone` (an orange carpet that competes with the passion colours).
#
# Passions are staged, not borrowed: Nelim gets eight different passions across hues and across the live/dormant divide, and the
# extra colonists get their own mix so the work tab grid is not one pawn tall. Names are the Sanctuary's own.
#
# Images go to Art/Gallery as `<index>-candidate-<name>.png`, under 2 MB each (8 MB the folder); an accepted one drops the word
# `candidate`, a refused one is deleted. They are opened and looked at: a green run proves the journey, not the picture.
@review
@requires:nelim.pickletools.screenshotstudio
@requires:nelim.pickletools.clearscreen
@requires:nelim.pickletools.inspecttabs
@requires:nelim.pickletools.screenshotmode
Feature: Skill Icons' windows, as pictures for the gallery

  Background:
    Given the save "Nelims-tribe" is loaded
    And game speed is paused
    And SkillIcons settings are at their documented defaults
    And I close all dialogs
    And Nelim's Pickle Tools: the tooltips are hidden
    And Nelim's Pickle Tools: the colonist bar is hidden
    And Nelim's Pickle Tools: the learning helper is hidden
    And Nelim's Pickle Tools: the resource readout is hidden
    And Nelim's Pickle Tools: the alerts are hidden

  Scenario: the Bio tab in the salon, with a passion set worth looking at
    Given SkillIcons sets "Nelim" skill "Shooting" passion to "Major"
    And SkillIcons sets "Nelim" skill "Melee" passion to "Minor"
    And SkillIcons sets "Nelim" skill "Construction" passion to "Major"
    And SkillIcons sets "Nelim" skill "Mining" passion to "Minor"
    And SkillIcons sets "Nelim" skill "Cooking" passion to "Major"
    And SkillIcons grants "Nelim" skill "Plants" the passion def "VSE_Natural"
    And SkillIcons sets "Nelim" skill "Medicine" passion to "Major"
    And SkillIcons sets "Nelim" skill "Intellectual" passion to "Minor"
    And Nelim's Sanctuary: I am at the sanctuary "sofa-corner"
    When I select "Nelim"
    And Nelim's Pickle Tools: I open the "Character" inspect tab
    Then Nelim's Pickle Tools: the "Character" inspect tab is open
    When I take a screenshot "7-candidate-bio-tab-salon"

  Scenario: the work tab in its three modes, over the bamboo backdrop
    Given a colonist "Miel" exists
    And a colonist "Sora" exists
    And SkillIcons sets "Nelim" skill "Cooking" passion to "Major"
    And SkillIcons sets "Nelim" skill "Medicine" passion to "Minor"
    And SkillIcons sets "Miel" skill "Mining" passion to "Major"
    And SkillIcons sets "Miel" skill "Construction" passion to "Minor"
    And SkillIcons sets "Sora" skill "Plants" passion to "Major"
    And SkillIcons sets "Sora" skill "Shooting" passion to "Minor"
    And Nelim's Sanctuary: I am at the sanctuary "window-backdrop-for-width"
    When SkillIcons work tab mode is set to "colour"
    And I select "Nelim"
    And I open the "Work" tab
    Then SkillIcons sees the active Work tab window open
    When I wait 15 ticks
    And Nelim's Pickle Tools: I move the mouse to (5, 5)
    And I take a screenshot "1-candidate-work-tab-colour"
    When SkillIcons work tab mode is set to "grey"
    And I wait 15 ticks
    And I take a screenshot "1-candidate-work-tab-grey"
    When SkillIcons work tab mode is set to "mixed"
    And I wait 15 ticks
    And I take a screenshot "1-candidate-work-tab-mixed"
    And I close all dialogs

  Scenario: the settings page, uncluttered, over the bamboo backdrop
    Given Nelim's Sanctuary: I am at the sanctuary "window-backdrop-for-height"
    When I open the SkillIcons settings dialog
    And Nelim's Pickle Tools: screenshot mode is enabled around the open windows
    And Nelim's Pickle Tools: I move the mouse to (5, 5)
    And I take a screenshot "3-candidate-settings-page"
    And Nelim's Pickle Tools: screenshot mode is disabled
    And I close all dialogs
