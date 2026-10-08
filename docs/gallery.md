# Gallery (Art/Gallery)
 Screenshots
Renamed 2026-10-08 from `Screenshots/NN-name` to `Art/Gallery/<index>-name` (PUBLISHING.md, "Images"); the old numbers in the text below are the files above.

 ScreenshotsCropped from reviewed Pickle captures. `3-settings-page.png` and
 Screenshots`7-bio-tab-skills.png` were regenerated on 2026-09-22 against PickleTools'
 Screenshots`nelim-zen-meadow-studio` fixture; their full frames and report are archived as
 Screenshots`pickle-reports-archive/0922-1623` in the collection checkout. The other PNGs
 Screenshotscome from the 2026-09-20 functional run.
 Screenshots
 ScreenshotsRegenerated wholesale on 2026-09-20. The previous set came from the 2026-09-19
 Screenshotsrun and two of its images were no longer true: the settings page still showed the
 Screenshots"Skill and work type icons" section that has since left for Work Studio, and the
 Screenshotswork tab mode trio showed three identical images, because of the defect that run
 Screenshotsexposed.
 Screenshots
 Screenshots| File | What it shows | Source capture |
 Screenshots|---|---|---|
 Screenshots| `3-settings-page.png` | The whole settings window on a clean configuration over PickleTools' zen studio, every documented default visible, and the live gallery now filling the space the departed section used to take | `0922-1623/manual--publication---settings-page--step0.png` |
 Screenshots| `1-work-tab-modes.png` | The three work tab modes, labelled and stacked. **The strongest single image**: colour is every heart red, greyed is every heart grey, mixed keeps the live passion red and greys the dormant ones | `manual--work-tab-mode-colour` / `-grey` / `-mixed` |
 Screenshots| `6-no-passion-icon.png` | The "no passion" icon off then on, side by side, with a real passion on the row below for scale | `manual--no-passion-icon-off` / `-on` |
 Screenshots| `7-bio-tab-skills.png` | Miel's Bio tab over PickleTools' zen studio, with the staged passion mix visible | `0922-1623/manual--publication---bio-tab--step0.png` |
 Screenshots| `5-worktab-icons-small.png` | Work tab passion icons at minimum size and opacity | `manual--work-tab-sliders-minimum` |
 Screenshots| `4-worktab-icons-large.png` | The same cells at maximum — the pair is the before/after for the two sliders | `manual--work-tab-sliders-maximum` |
 Screenshots| `2-passions-animated.gif` | **Sixteen passions animating, 6s, looping seamlessly.** The one thing a still cannot carry | composed from the shipped frames, not from a screen capture |
 Screenshots
 Screenshots## How they were made
 Screenshots
 ScreenshotsEach is a straight crop of a real frame, with no resampling. `02` and `03` are
 Screenshotscomposites of two or three such crops with a label drawn above each pane; nothing
 Screenshotsinside a pane is retouched. The exact rectangles are in this session's transcript
 Screenshotsand are reproducible from the source captures, which are not deleted.
 Screenshots
 Screenshots## If these go on the Workshop
 Screenshots
 ScreenshotsThey are evidence-grade before they are marketing-grade: real UI, real colonists,
 Screenshotsbut test-fixture colonists, with low skill levels. That does not matter for
 Screenshots`02`, `05` and `06`, which are grids of icons rather than portraits of a colony,
 Screenshotsand those are the three that actually show what the mod does. `07` needs no such
 Screenshotscaveat at all, having never been near a colony. `04` is the weakest
 Screenshotsfor that reason.
 Screenshots
 Screenshots## The GIF
 Screenshots
 Screenshots`2-passions-animated.gif` is not a screen capture. It is composed directly from
 Screenshots`Mod/1.6/Textures/Passions/Animated/`, the frames the mod actually ships, so it is
 Screenshotssource-quality with no interface around it.
 Screenshots
 ScreenshotsSixteen sequences, chosen on one criterion: their period has to divide six seconds
 Screenshotsexactly, so the loop closes with no jump. A passion plays at its own rate - the
 Screenshotsspec table gives 6, 8, 10 and 12 fps - and each cell advances by the mod own
 Screenshotsformula, `floor(elapsed * fps) % frameCount`, sampled at 20 fps. At six seconds
 Screenshotsevery one of them lands back on frame zero together.
 Screenshots
 ScreenshotsThe twenty-four sequences left out are not worse; their periods are 1.6s, 2.4s,
 Screenshots5.33s or 6.67s, which do not divide six. Widening the set means a longer loop: the
 Screenshotsnext clean length is twelve seconds, at twice the frames and twice the weight.
