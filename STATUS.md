---
localization: complete
translation_en: complete
translation_fr: complete
settings_audit: passed
mod:          Skill Icons
packageId:    nelim.skillicons
repo:         Rimworld-Skill-Icons
visibility:   public
detached:     yes
workflow_stage: playTests[1.1.0]
code_review_sha: 56a2cca1b9decf16207613f2a7195c44cca6ed37  # 2026-10-10, /code-review low on c91d66b..HEAD (Source/, Mod/): 1 finding (dead .steamignore entry), fixed in this commit
publication_changelog_review_sha: c0310e40c0708bf5d1ec81900784ed719eb98fa7  # 2026-10-10, owner (Virginie) in the chat: validated after the three wording changes
licence:      original
licence_at:   original work, MIT; Oracle's Skill Icon Retextures credited for the visual language only, no texture reused (verified against ATTRIBUTION.md and the generator)
upstream_mod_remotes:
  - https://github.com/Vanilla-Expanded/VanillaSkillsExpanded
  - N/A (Alpha Skills and Oracle's Skill Icon Retextures: no git repository found, 2026-10-08)
dependencies: declared
showcase:     complete
tested_on:    2026-10-10, headless WSL, sha 0332ec3 (1.0.3 code), 13 tickets, summary in docs/runs/2026-10-10-0332ec3-summary.md; non-regression 2026-10-11 on 85278dd, docs/runs/2026-10-11-85278dd-nonregression.md. Green: sans-facultatifs (the 2 reds are the by-design 13 and 16), avec-alphaskills 7 of 7, Oracle 15 and 16, RIMMSQOL 4 of 4, restart 12 then 13, Krypt, Better, Compact and Enhanced Work Tab (2 passed, 1 skipped each: the Bio tab scenario needs Alpha Skills), French 02, 09 and 10, French persistence 08. Older runs: docs/runs/2026-09-20-2319-summary.md, docs/runs/2026-09-23-44fde64-summary.md, docs/runs/status-history-2026-09-to-10.md.
workshop:     3805383957, created 2026-09-21 00:07, switched to public the same night. Page
              checked as an anonymous visitor: title "Skill Icons", 1.6, 1.897 MB, the Preview
              and the work tab screenshot in place, and the description rendering its four
              blocks with the GitHub link live. The item went up ahead of the now-completed test
              chain. PUBLICATION.md
              holds what the page needs. The three thank-you comments have been posted.
remaining:
  - known limit, not a defect (docs/TESTING.md "Enhanced Work Tab"): under Enhanced Work Tab the Work tab modes, size and opacity have no visible effect, the replacement draws its own cell and passion marker.
  - known, not a defect: a plain run of the whole suite is red. 16 fails without Oracle staged and 13 refuses to pass when 12 ran in the same process, both by design; they are run by name.
  - declarations 2026-10-11: scripts to Audit (rows in scripts/LOCAL_SCRIPTS.md); Pickle steps to NPT (no format, Elsewhere/SkillIcons.md exists, steps stay local); `.github` regenerated to template stamp 7a8f3a601751 (CICD.md: CI-owned, not declared), publication items sent to CI/CD for information.
session:      local_44ffc092-9e34-441b-936d-02d01889828c
updated:      2026-10-11 (1.0.3 published, followUp, cleanup 14.c/14.d, local scripts declared); 2026-10-10 (playTests closed on 0332ec3); 2026-10-09 (strings reworded, FRENCH_REVIEW.md regenerated); older entries in docs/runs/status-history-2026-09-to-10.md.
history:     updated_1 to updated_9 and the dated sections before 2026-10-08 are folded into docs/runs/status-history-2026-09-to-10.md (2026-10-09)
dry_run:     2026-10-11, run 38092173750 (green, read in the log), SHA 85278dd4bed146ddeaacbe7bd69a633a0f047792, version 1.0.3, options update_preview=true update_description=true (a publish needs the same options). Log: `Publishing 85278dd... as version 1.0.3`; no build project, tracked Mod/ ships as is (1024 files, 2.03 MB); change note from PUBLICATION.md 1.0.3 (first line `[h3]1.0.3 - Skill Icons[/h3]`); preview to send 190006 bytes sha256 426a8578... (the page serves 64321 bytes, it would be replaced); description 4504 bytes from PUBLICATION.md `## Steam description` converted to BBCode. CHANGELOG dated `## [1.0.3] - 2026-10-11` in that commit. Rollback target: tag v1.0.2 (0b601d8). PUBLISHED 2026-10-11 (22:43 UTC 2026-10-10): publish run 38092317984 approved by the owner, green, read in the log (new content ManifestID 3335308165184046039 and new preview uploaded to item 3805383957); tag v1.0.3 on 85278dd and GitHub release created by the CI; Workshop page read as an anonymous visitor: new preview image, description with the GitHub link and "If I go quiet", change note "1.0.3 - Skill Icons" present. PublishedFileId unchanged. Gallery uploaded by hand and subscription test of the item done by the owner (said "fait" in the chat, 2026-10-11). Non-regression 14.a 2026-10-11 on 85278dd: whole suite twice (75ac sans-facultatifs 14 passed 2 failed 12 skipped, e092 avec-alphaskills 19 passed 2 failed 7 skipped), the two reds are the by-design 13 and 16, no regression; docs/runs/2026-10-11-85278dd-nonregression.md.
echo_review_sha: 88a212cf0076f7e5dcad75e2e714ff6adcae87ef
social_preview_sha256: 426a85787537d510e0f89c988937695632e26ea7c544420693c052d06b22bc8c  # uploaded 2026-10-10 by the session through the repository settings, og:image downloaded and compared (190006 bytes)
protocols_read_sha: b4c2c58a55479ef3e5fb3f98d333e541cb105462
---

# Skill Icons — status

## State

**2026-10-15: chain reopened for the 1.7 tag, `playTests[1.1.0]`** (owner's word in the chat: bump the minor, move to 1.7). The tag 1.7 is a MINOR version (AUDIT.md, "Passe 1.7"): `1.0.3` becomes `1.1.0`, published with `update_tags=true`. Stages `code` to `writeTests` are unchanged and confirmed by this line: no commit of `Source/` or `Mod/` since `code_review_sha` (56a2cca), settings, translations and dependencies untouched. Open: the 1.7 pass itself (a diagnostic, variant of `playTests`). First test the current `net472` DLL on 1.7 (Harmony, `UnityEngine` and reflection on private members are assumed, not verified). English only (the 1.7 install ships no French pack). RIMMSQOL has no 1.7 version, so its scenarios are skipped with the reason in `docs/runs/`. `<li>1.7</li>` is NOT in `supportedVersions` and `CHANGELOG.md` has no 1.1.0 entry yet: both come after a green 1.7 run, in the same commit as the Preview badge refresh. `tested_1_7` stays absent until then. Not run: no 1.7 Pickle ticket filed yet. Previous state: `dormant` since 2026-10-11 (cleanup 14.c, 14.d done). 1.0.3 is published (sha 85278dd, tag v1.0.3, run 38092317984), page, gallery and subscription test checked, non-regression green on 85278dd (the only reds are the by-design 13 and 16). Rollback target: tag v1.0.2 (0b601d8).

Gates: `code_review_sha` and `publication_changelog_review_sha` valid, `settings_audit: passed`, `translation_en/fr: complete` (French validated by the owner 2026-10-09, `FRENCH_REVIEW.md` regenerated by `scripts/Make-FrenchReview.ps1`), GitHub social preview equals `Mod/About/Preview.png`, Gallery 0 to 7 accepted.

Where things are: Steam description in `PUBLICATION.md` `## Steam description` (CI converts it, `.github/publish.config.json`); Pickle runs in `docs/runs/` and `Tests/Pickle/Evidence/`; earlier audits (2026-10-08 to 2026-10-11) in `docs/runs/status-audits-2026-10-08-to-11.md`; older history in `docs/runs/status-history-2026-09-to-10.md`.

Local scripts declared to the Audit session 2026-10-11 (`scripts/LOCAL_SCRIPTS.md`): `Run-Tests.ps1` now on the shared harness, `preview.js` reduced to the text-free Preview background, `Run-Pickle.ps1` and the three `animation-source/Tools/Build-*.ps1` deleted. `.github` regenerated from the current template (75 tests green, `Check-CiTemplate.ps1`: identical).

## Cleanup 2026-10-11 (AUDIT 14.c, 14.d)

Branches: `ci/pin-scripts-and-idempotence`, `ci/steam-publish-tag`, `docs/dispatch-script`, `docs/publish-by-ci` deleted (local and origin, all merged); kept `ci/dry-run-folders-and-links` and `tmpl-src` (not mine to delete). Evidence: 9 folders pruned (227.7 MB: the 1010 Work Tab matrices, 1010-french, 1010-french-persistence, 1010-f01-*, 1010-avec-alphaskills); 8 stay. Docs: STATUS, TESTING and PUBLICATION folded into `docs/runs/` (status-audits-2026-10-08-to-11, testing-history-2026-09-to-10, publication-sent-texts-2026-09-to-10); BACKLOG kept (both ideas still open). WSL: the two Workshop items of the cache named by this mod's maps (3250322299, 3552152340) are also named by WorkStudio's `wsl-deps`, so nothing was removed and the machine lock was not needed.
