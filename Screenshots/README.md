# Screenshots

Cropped from the 2026-09-19 Pickle run's own captures, which live in
`PickleReports/screenshots/` beside the saves. The full frames are 1920x1080 of a
heavily modded test session: Pickle's own overlay, another mod's "warming up"
popup, RimLogging errors down the right edge, and a taskbar of unrelated mods.
None of them is publishable whole. These are the parts that are.

| File | What it shows | Source capture |
|---|---|---|
| `01-settings-page.png` | The settings window on a clean configuration, every documented default visible | `manual--settings-page-defaults--step0.png` |
| `02-worktab-icons-small.png` | Work tab passion icons at minimum size and opacity | `manual--work-tab-sliders-minimum--step0.png` |
| `03-worktab-icons-large.png` | The same cells at maximum — the pair is the before/after for the two sliders | `manual--work-tab-sliders-maximum--step0.png` |
| `04-bio-tab-skills.png` | The skill list, hearts varying by passion state | `manual--bio-tab-mixed-passions--step0.png` |

## What is deliberately not here

- **The three work tab modes** (colour / greyed / mixed). Their three captures are
  identical, because of the defect recorded in `docs/TESTING.md` Scenario 3 and
  fixed the same day: the grey path went through the animation lookup, which only
  has colour frames, so it returned a coloured frame and undid the mode. The fix
  is in, unverified on screen. Re-shoot the trio before using it to show anything.
- Anything showing skill or work type icons as a *feature* of this mod. That set
  is moving to Work Studio, so `01-settings-page.png` will need re-shooting once
  its "Skill and work type icons" section goes.

## If these get used on the Workshop

They are evidence-grade, not marketing-grade: real UI, real colonists, but a test
fixture's colonists, with low skill levels and unflattering traits. A dedicated
capture pass on a small modlist, with a colony worth looking at, would beat every
one of them.
