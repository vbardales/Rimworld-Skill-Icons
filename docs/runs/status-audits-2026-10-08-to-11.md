# STATUS.md dated sections, folded 2026-10-11 (14.c)

Verbatim from STATUS.md at the cleanup; the live state is in STATUS.md.

## Audit 2026-10-10 (up to the old `tested`)

Audited at `ed6593b`, tree clean. **`tested` (= `shootGallery`) -> `playTests[1.0.3]`.** Scope: transitions 1 to 8 only; gallery, Preview, docs and release states (9 and later) were not re-audited here.

- 1 to 7: held. Standalone repo, `main`, public; `Art/ModIcon-source.png` (2026-10-08) older than `ModIcon.png` (26 KB) and both `.ico`; `Mod/1.6/Assemblies` DLL committed with its Source change (f8aa607); CHANGELOG 1.0.3 dated; `About.xml` declares Harmony and VSE as hard dependencies, `loadAfter` for Alpha Skills and Oracle (nothing in `Source/` references Alpha Skills); `settings_audit: complete`, `translation_en/fr: complete` (French validated 2026-10-09 on `a8932bb`, `FRENCH_REVIEW.md` regenerated since); `Check-DefInjected.ps1`: 2 keys, 0 errors; out-of-game harness `Run-Tests.ps1` replayed today: 25 of 25 pass; 17 Pickle features, no `@wip`.
- 8 fails (8.a, 8.c, 8.f): TESTING.md's own rerun rule says a code change invalidates the passes, and TESTING.md records that neither the `sans-facultatifs` nor the `avec-alphaskills` pass "has run since the change". The only report on disk is `0923-44fde64-sans-facultatifs`. The 2026-09-22 passes (Oracle, RIMMSQOL, restart, French, Work Tab matrices) predate that code and are not repeated. This is an unverified in-game pass of the current build, not a defect found.
- Not blocking: feature 10 post-deploy replay on the reworded strings (text-only edit, runs after deploy).
- Closed later the same day: 11 Pickle tickets on `0332ec3` all read (docs/runs/2026-10-10-0332ec3-summary.md), captures opened, `settings_audit: passed` (English and French replayed), `code_review_sha` still valid (no `Source/` or `Mod/` commit since). `playTests` -> `shootGallery[1.0.3]`.
- Reserve, optional: `AUDIT.md` 7.a names `TEST_SCENARIOS.md`; this mod keeps its scenarios in `docs/TESTING.md` (the linter raises no error).

## Audit 2026-10-10, second pass (shootGallery to writeDocs)

Audited at `ed6593b` plus the STATUS commits of the day (no `Source/`, `Mod/` or `Art/` change). **`shootGallery[1.0.3]` -> `mountPreview[1.0.3]`, then `writeDocs[1.0.3]`** once the GitHub social preview was replaced (same day, see 10.f below).

- **9 shootGallery, held.** `Art/Gallery/` holds 0 to 7, contiguous, no candidate, 2.96 MB (each image under 2 MB); `0-preview.png` is byte-identical to `Mod/About/Preview.png`; order justified in `PUBLICATION.md`; all eight images opened (the GIF through frame 10 of 120), accepted by the owner on 2026-10-09 for 1, 3 and 7.
- **10 mountPreview, one blocker.** `Preview.png` is 896 x 504, 190006 bytes; palette and config present; echo decided 2026-10-10, keep: the line-art hearts carry the same language as the gallery (a heart with one small mark per passion), recognisable at 268 px, no mismatch with the accepted captures (`echo_review_sha`); contrast measured on the rendered PNG: title and copy lines about 15:1, badge digits (`#151219` on `#B162D0`) about 4.9:1. **10.f not met: the GitHub social preview is the old image** (og:image `repository-images.githubusercontent.com/1355970754/...`: 64321 bytes, sha256 `5a39f9c1...`, the Preview now in the repository is 190006 bytes, sha256 `426a8578...`). Replaced the same day through the repository settings (Chrome, the owner's session); og:image re-downloaded: 190006 bytes, sha256 `426a8578...`, identical to `Mod/About/Preview.png`; `social_preview_sha256` recorded.
- **Seen further down the chain, not blocking this state.** (11.c, fixed later the same day, see `remaining`) `Mod/About/About.xml` `<description>` differs from the plain text of `Mod/README.template.md` (`node .github/scripts/sync-about-description.mjs` exits 1: plain-text section titles and link rendering). Correcting it touches `Mod/`, which reopens `code_review_sha` and `playTests` (AUDIT.md 8.m), so it is left to the owner's call. (11.j) `publication_changelog_review_sha` is absent. (11.b) the label, position and target of the GitHub link are not recorded here.

| Order | File | Why this place |
|---|---|---|
| 0 | `0-preview.png` | The Preview, byte copy. |
| 1 | `1-work-tab-modes.png` | Three work tab modes stacked: shows what the mod does and why it has settings. |
| 2 | `2-passions-animated.gif` | Sixteen passions animating: what a still cannot carry. |
| 3 | `3-settings-page.png` | The settings window with the live gallery. |
| 4 | `4-worktab-icons-large.png` | Work tab at maximum size and opacity. |
| 5 | `5-worktab-icons-small.png` | Same at minimum (4 and 5 are the before and after of the sliders). |
| 6 | `6-no-passion-icon.png` | "No passion" icon off then on. |
| 7 | `7-bio-tab-skills.png` | Nelim's skill list in the Sanctuary, eight different passion icons. |

## Translation audit — 2026-09-30

Where the French lives, for Virginie's review (TRANSLATIONS.md, "Systematic French review by
Virginie"): `Mod/Languages/French/Keyed/SkillIcons.xml` (15 strings) and
`Mod/Languages/French/DefInjected/MainButtonDef/MainButtons.xml` (2 strings, the hidden shortcut's
label/description). No grammar files, no `{PAWN_gender ? ...}` switch anywhere in this mod - no
French text agrees with a specific pawn's gender.

Full text, both languages, side by side: `FRENCH_REVIEW.md` at the mod root, regenerated from the
shipped XML by `scripts/Make-FrenchReview.ps1`, current revision `a8932bb`.

One text flagged `?`: `SkillIcons.ShowNoneDesc` says "un.e colon" - the project's inclusive-article
convention for "colon" (already epicene: `un colon`/`une colon`, TRANSLATIONS.md) applied to a
generic statement about any pawn, not the engine's 3-segment neutral switch (there is no specific
pawn to switch on here). Flagged for her call on whether the inclusive article reads right in this
sentence, not because a defect is suspected.

French review recorded 2026-10-09: validated by the owner (Virginie) on `FRENCH_REVIEW.md` at revision `a8932bb`. `translation_fr: complete`.

## Gallery and art pass — 2026-10-08

**2026-10-09: gallery pass done.** Images 1, 3 and 7 accepted by the owner (`Art/Gallery/` holds 0-7, no candidate, 4.1 MB). The grant-passion step was fixed (it set Major/Minor instead of VSE's PassionDef index); the pass map now carries the Sanctuary's full minimum list and seeds.

`prepublished` → `tested`: the owner replaced the gallery scenario (Sanctuary of Nelim) and the ModIcon source, so the
gallery gate of AUDIT.md section 11 is open again (`Art/Gallery/` holds no accepted Sanctuary capture yet).

- `Art/ModIcon-source.png` changed: `Mod/About/ModIcon.png`, `Mod/About/Preview.png`, `Art/Gallery/0-preview.png` and both
  `.ico` regenerated by `scripts/Render-Preview.cjs` (config gained `modIconSource`; the badge asset is
  `Art/.render/ModIcon-badge.png`, trimmed with `Make-PreviewBadge.ps1 -TrimAlphaOnly`, ignored). Preview opened and read.
- Gallery moved from `Screenshots/` to `Art/Gallery/` as `<index>-name`; `galleryDir` is `Art/Gallery`.
- `11-publication-shots.feature` (zen studio) replaced by `11-gallery-sanctuary.feature` (pass `wsl-deps.sanctuary.map`).
  Places chosen on the descriptions of every named place (the empty photographs are not on this machine): `sofa-corner`,
  `window-backdrop-for-width`, `window-backdrop-for-height`; rejected places and reasons are in the feature header.
- Ticket `20261008-231733-842-0abd` deposited (tree frozen at `cba867f`), relayed through Ticket Manager: TicketDispatcher
  unreachable. Candidates will land as `Art/Gallery/<index>-candidate-<name>.png`.
- PUBLICATION.md checked against PUBLISHING.md: gallery section rewritten; one divergence left for the owner, not changed
  (published item): Alpha Skills is a hard `modDependencies` entry although no code references it (PUBLISHING: that is
  `loadAfter`).
- `_tools/` became `scripts/`; stale `_tools/ModIcon-source.png` removed. `build/` (formerly `.build/`), `.claude/`, `.github/` stay (build
  output, local settings, CI).

## Audit — 2026-10-08

Audited at `24b964d`, replayed on `95196b0` with local changes from other sessions left untouched (CI scripts, `Mod/About/Preview.png`,
`Art/Gallery/`, staged `TRADUCTION.md` and French Keyed). **`prepublished` → `prepublished`**, no change (set by the 1.0.3 session on `main`; the 1.0.3 gallery gate was not re-examined here).

- Item 3805383957 exists, `About/PublishedFileId.txt` committed; CHANGELOG runs 1.0.0–1.0.2 (the item was created
  in game at 1.0.0, so there is no `0.1.0` entry to add).
- `done → tested` conditions, checked against the files: no `@wip` in `Tests/Pickle/Mod/Pickle/Features`; every
  `@requires` scenario has its named pass (record in `tested_on` and `updated_4`); no manual test left. Out-of-game
  harness replayed today: 25 of 25 pass. No Pickle run made (none asked, none needed).
- Fixed: `workflow_stage` and `upstream_mod_remotes` added (Vanilla Skills Expanded repository found; Alpha Skills
  and Oracle's set have none). The PR to upstream is in `BACKLOG.md`, not sent (public: Virginie decides).
- Evidence: the two PNGs in `docs/runs/` removed from git and ignored; no `.dds` is tracked (ignored already, the
  local ones are the game's cache); `Tests/Pickle/Evidence/` holds one run, 26 KB, kept. Rules in `docs/TESTING.md`.
- Not touched: `translation_fr: unchecked` (set by the French-agreement review, `TRADUCTION.md` pending).
- Reading record: `docs/PROTOCOLS-READ.md`.
