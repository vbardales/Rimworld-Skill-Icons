# Non-regression 2026-10-11, published sha 85278dd (1.0.3)

Headless WSL, whole suite, two tickets, reports in `Tests/Pickle/Evidence/1011-nonreg-*` (ignored by git). Same code as 0332ec3: only About.xml, .steamignore, the removed README.template.md and the build/ props changed since.

| Ticket | Pass | Result |
|---|---|---|
| 75ac | sans-facultatifs, English, whole suite | 28 found: 14 passed, 2 failed, 12 skipped (`@requires`), identical to 991f on 0332ec3 |
| e092 | avec-alphaskills, English, whole suite | 28 found: 19 passed, 2 failed, 7 skipped |

The two failures in both tickets are the by-design reds, run by name elsewhere: 13 ("the new process starts with what the old one wrote", refuses to pass when 12 ran in the same process) and 16 ("another icon set is actually loaded and claiming the same paths", needs Oracle staged). Both passed in their own tickets on 0332ec3 (restart 12 then 13, Oracle 15 and 16). Verdict: no regression.
