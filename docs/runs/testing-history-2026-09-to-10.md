# TESTING.md status lines, folded 2026-10-11 (14.c)

Verbatim from docs/TESTING.md at the cleanup; the current state is in docs/TESTING.md "Status".

## Status

| | State |
|---|---|
| Loads without error (Scenario 0) | **observed, 2026-09-17** - see below |
| The out-of-game harness | **25 of 25 pass**, 2026-09-19 |
| Scenario 1 (icons in three places) | **passed** on the Work tab and pawn creation screen, Bio tab confirmed 2026-09-19 |
| Scenario 2 (settings defaults) | **passed**, 2026-09-19 |
| Scenario 3 (three work tab modes) | **passed**, 2026-09-20, after the defect it exposed was fixed |
| Scenario 4 (size/opacity sliders) | **passed**, 2026-09-19 |
| Scenario 5 (the "no passion" icon) | **passed**, 2026-09-20 |
| Scenario 9 / Feature 17 (the MainButtons shortcut) | Mod-owned path **passed**, 2026-09-20; dedicated RIMMSQOL pass **4/4 passed**, 2026-09-22, with all four captures reviewed including 150% scale |
| Scenario 11 (the def fixes) | **passed**, 2026-09-20, asserted against the loaded DefDatabase. Down to two, as of 2026-09-22: Sarg Bjornson fixed three of the original four Alpha Skills findings upstream, see below |
| Scenario 8 (persistence) | in-process round trip **passed**; the strengthened real restart **passed**, 2026-09-22, writer 1/1 then existing-save reader 1/1 in distinct processes under one ticket |
| Scenario 10 (English and French) | **passed in both passes**, 2026-09-21, once it stopped switching language mid-run |
| Scenarios 6, 7 | removed with the feature they tested, 2026-09-19 |

---

**Completed 2026-09-22:** RIMMSQOL 4/4; restart writer 1/1 then reader 1/1; Better, Compact,
Enhanced and Krypt each 3/3. All required reports were complete with no skips, and every review
capture was opened: four for RIMMSQOL and nine for each replacement Work Tab. The gallery pass also
passed 2/2 and its two final publication images were reviewed separately.

**Measured 2026-09-21, and the first time this pass has run:** `15` and `16` with Oracle staged, 2 scenarios,
2 passed, `exitReason: passed`. `16` passing is the evidence that matters - it asserts two mods really
ship the same paths, so Oracle was mounted and the contest was real - and `15` passing means this
mod won it. A green there is therefore worth reading, which it would not have been without `16`.

---

- **What this mod keeps today:**
  - `docs/runs/2026-09-23-44fde64-summary.md` - features 01 to 10, 14 and 15 on the shipped build,
    18 of 18 (report on disk in `Tests/Pickle/Evidence/0923-44fde64-sans-facultatifs/`).
  - The passes the latest run does not repeat, each the only proof of its check: the Oracle map
    (feature 16), RIMMSQOL (17), the gallery captures (11, to be replayed in the sanctuary pass), the two-process restart (12 then 13),
    the French pass of features 09 and 10, and the four replacement Work Tab matrices.
