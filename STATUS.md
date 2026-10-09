---
localization: complete
translation_en: complete
translation_fr: complete
settings_audit: complete
mod:          Skill Icons
packageId:    nelim.skillicons
repo:         Rimworld-Skill-Icons
visibility:   public
detached:     yes
stage:        tested
workflow_stage: tested
code_review_sha: cba867f354933701d360faba31e8f8db46678ed8  # was `code_review`: <sha> (2026-10-08, /code-review low on Source/, from the first commit; 2 low findings, both fixed in f8aa607913d0598a985b581bfc78a9e6b8b98fdc: gallery rect height floored, EstDessinTexture comment corrected; DLL rebuilt)
licence:      original
licence_at:   original work, MIT; Oracle's Skill Icon Retextures credited for the visual language only, no texture reused (verified against ATTRIBUTION.md and the generator)
upstream_mod_remotes:
  - https://github.com/Vanilla-Expanded/VanillaSkillsExpanded
  - N/A (Alpha Skills and Oracle's Skill Icon Retextures: no git repository found, 2026-10-08)
dependencies: declared
showcase:     complete
tested_on:    2026-09-22, headless WSL, by named pass. Green: scenario 10 in both language passes; the
              real restart (12 then 13 as two launches in one ticket); the MainButtons shortcut,
              including that a value written through it reads back through Options and that the
              def goes hidden -> drawn -> hidden; the animations (an animated passion draws a
              different frame, one with none draws the same); avec-oracle (15 and 16, 2 of 2).
              Earlier, 2026-09-20: the whole suite once, 16 of 17, summary kept in
              docs/runs/2026-09-20-2319-summary.md. NOT run as one whole since the suite grew to
              25 scenarios in 16 features, and a plain whole run is red by design (see remaining).
              2026-09-22 completion evidence: RIMMSQOL 4/4 with all four captures reviewed;
              restart writer 1/1 then reader 1/1 in distinct processes under one ticket; Better,
              Compact, Enhanced and Krypt Work Tab matrices each 3/3, with every one of their nine
              captures reviewed. Publication-only studio pass: 2/2 passed against PickleTools'
              `nelim-zen-meadow-studio`; both captures reviewed. The first green attempt was
              rejected because screenshot mode hid the Bio InspectTab, then corrected and rerun.
workshop:     3805383957, created 2026-09-21 00:07, switched to public the same night. Page
              checked as an anonymous visitor: title "Skill Icons", 1.6, 1.897 MB, the Preview
              and the work tab screenshot in place, and the description rendering its four
              blocks with the GitHub link live. The item went up ahead of the now-completed test
              chain. PUBLICATION.md
              holds what the page needs. The three thank-you comments have been posted.
remaining:
  - known, not a defect: a plain run of the whole suite is red. 16 fails without Oracle staged and
      13 refuses to pass when 12 ran in the same process, both by design. They are run by name.
      Moving them to a companion suite a plain launch does not select is proposed, not done.
  - unverified: feature 10 (English and French) not rerun on the 1.0.3 string fixes. The Pickle
      queue was deep (48+ tickets) at the time of the change; a change to existing string content,
      not a new/removed key, does not invalidate the whole `tested` gate (AUDIT.md line 249), so
      `stage` is `prepublished` rather than dropped to `tested`. Rerun feature 10 before publish,
      or accept the risk explicitly - two wording fixes with no raw-key risk (both keys already
      existed and are unchanged in structure).
  - unverified: "French review by Virginie" (TRANSLATIONS.md, 2026-09-30). `translation_fr` reset
      to `unchecked` project-wide by that rule; not a defect found in this mod. `FRENCH_REVIEW.md`
      generated at mod root by `_tools/gen-french-review.js` (reads shipped XML, not hand-written)
      for her to read. `translation_fr` stays `unchecked` until she reviews and a dated line is
      recorded under `Translation audit` below - a session cannot record this itself.
session:      local_314cf7e0-0763-4b3b-b4b7-03e564331dc5
updated:      2026-10-09 (strings reworded on the owner's review proposal, un.e colon removed, FRENCH_REVIEW.md regenerated, feature 10 still to rerun); previously 2026-09-30, TRANSLATIONS.md's French agreement/review rules (2026-09-30) applied.
              `translation_fr` reset `complete` -> `unchecked`, project-wide rule, not a defect
              found here. Audit: only two French files ship
              (`Languages/French/Keyed/SkillIcons.xml`, `.../DefInjected/MainButtonDef/MainButtons.xml`),
              15 Keyed + 2 DefInjected strings, none uses a `{PAWN_gender ? ...}` switch - no text
              agrees with a specific pawn's gender. One text names a pawn generically ("un.e colon
              n'a aucune passion", `SkillIcons.ShowNoneDesc`): flagged `?` in `FRENCH_REVIEW.md`,
              since "un.e" is this project's inclusive-article convention (Virginie, confirming
              "colon" as epicene) applied to a generic statement, not the engine's 3-segment
              switch. `FRENCH_REVIEW.md` regenerated (script `_tools/gen-french-review.js`) at
              revision `0a4be43`. `stage` unchanged; `translation_fr` blocks nothing already
              `published`/`prepublished`, per TRANSLATIONS.md's "preserve historical stages".
history:     updated_1 to updated_9 and the dated sections before 2026-10-08 are folded into docs/runs/status-history-2026-09-to-10.md (2026-10-09)
---

# Skill Icons — status

## Translation audit — 2026-09-30

Where the French lives, for Virginie's review (TRANSLATIONS.md, "Systematic French review by
Virginie"): `Mod/Languages/French/Keyed/SkillIcons.xml` (15 strings) and
`Mod/Languages/French/DefInjected/MainButtonDef/MainButtons.xml` (2 strings, the hidden shortcut's
label/description). No grammar files, no `{PAWN_gender ? ...}` switch anywhere in this mod - no
French text agrees with a specific pawn's gender.

Full text, both languages, side by side: `FRENCH_REVIEW.md` at the mod root, regenerated from the
shipped XML by `_tools/gen-french-review.js`, current revision `0a4be43`.

One text flagged `?`: `SkillIcons.ShowNoneDesc` says "un.e colon" - the project's inclusive-article
convention for "colon" (already epicene: `un colon`/`une colon`, TRANSLATIONS.md) applied to a
generic statement about any pawn, not the engine's 3-segment neutral switch (there is no specific
pawn to switch on here). Flagged for her call on whether the inclusive article reads right in this
sentence, not because a defect is suspected.

French review recorded 2026-10-09: validated by the owner (Virginie) on `FRENCH_REVIEW.md` at revision `a8932bb`. `translation_fr: complete`.

## Gallery and art pass — 2026-10-08

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
- `_tools/` became `scripts/`; stale `_tools/ModIcon-source.png` removed. `.build/`, `.claude/`, `.github/` stay (build
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

