# Screenshots

Cropped from the 2026-09-20 Pickle run's own captures, which live in
`PickleReports/screenshots/` beside the saves. The full frames are 1920x1080 of a
heavily modded test session: Pickle's own overlay, RimLogging errors down one
edge, and a taskbar of unrelated mods. None of them is publishable whole. These
are the parts that are.

Regenerated wholesale on 2026-09-20. The previous set came from the 2026-09-19
run and two of its images were no longer true: the settings page still showed the
"Skill and work type icons" section that has since left for Work Studio, and the
work tab mode trio showed three identical images, because of the defect that run
exposed.

| File | What it shows | Source capture |
|---|---|---|
| `01-settings-page.png` | The whole settings window on a clean configuration, every documented default visible, and the live gallery now filling the space the departed section used to take | `manual--settings-page-defaults` |
| `02-work-tab-modes.png` | The three work tab modes, labelled and stacked. **The strongest single image**: colour is every heart red, greyed is every heart grey, mixed keeps the live passion red and greys the dormant ones | `manual--work-tab-mode-colour` / `-grey` / `-mixed` |
| `03-no-passion-icon.png` | The "no passion" icon off then on, side by side, with a real passion on the row below for scale | `manual--no-passion-icon-off` / `-on` |
| `04-bio-tab-skills.png` | The skill list, hearts varying by passion state | `manual--bio-tab-mixed-passions` |
| `05-worktab-icons-small.png` | Work tab passion icons at minimum size and opacity | `manual--work-tab-sliders-minimum` |
| `06-worktab-icons-large.png` | The same cells at maximum — the pair is the before/after for the two sliders | `manual--work-tab-sliders-maximum` |
| `07-passions-animated.gif` | **Sixteen passions animating, 6s, looping seamlessly.** The one thing a still cannot carry | composed from the shipped frames, not from a screen capture |

## How they were made

Each is a straight crop of a real frame, scaled by an integer factor with
nearest-neighbour so no pixel is invented or smoothed. `02` and `03` are
composites of two or three such crops with a label drawn above each pane; nothing
inside a pane is retouched. The exact rectangles are in this session's transcript
and are reproducible from the source captures, which are not deleted.

## If these go on the Workshop

They are evidence-grade before they are marketing-grade: real UI, real colonists,
but a test fixture's colonists, with low skill levels. That does not matter for
`02`, `05` and `06`, which are grids of icons rather than portraits of a colony,
and those are the three that actually show what the mod does. `07` needs no such
caveat at all, having never been near a colony. `04` is the weakest
for that reason.

## The GIF

`07-passions-animated.gif` is not a screen capture. It is composed directly from
`Mod/1.6/Textures/Passions/Animated/`, the frames the mod actually ships, so it is
source-quality with no interface around it.

Sixteen sequences, chosen on one criterion: their period has to divide six seconds
exactly, so the loop closes with no jump. A passion plays at its own rate - the
spec table gives 6, 8, 10 and 12 fps - and each cell advances by the mod own
formula, `floor(elapsed * fps) % frameCount`, sampled at 20 fps. At six seconds
every one of them lands back on frame zero together.

The twenty-four sequences left out are not worse; their periods are 1.6s, 2.4s,
5.33s or 6.67s, which do not divide six. Widening the set means a longer loop: the
next clean length is twelve seconds, at twice the frames and twice the weight.
