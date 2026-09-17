---
localization: partial
translation_en: partial
translation_fr: partial
settings_audit: partial
mod:          SkillIcons
packageId:    nelim.skillicons
repo:         Rimworld-Skill-Icons
visibility:   public
detached:     no
stage:        dansMonoRepo
licence:      original
licence_at:   original work, MIT; Oracle's Skill Icon Retextures credited for the visual language only, no texture reused (verified against ATTRIBUTION.md and the generator)
dependencies: declared
showcase:     complete
tested_on:
workshop:
remaining:
  - defect: no MainButtons shortcut (MainButtonDef) exists for RIMMSQOL/customization
      tools, although useful settings exist; MOD_SETTINGS.md requires one, hidden by default.
  - defect: README's Development section states stale counts ("74 static textures,
      114 animation frames, 74 silhouettes") that no longer match the shipped content
      (85 static textures, 920 animation frames, 85 silhouette PNGs, all counted on disk).
  - unverified: no automated test harness, XML test script, or Gherkin/pickle scenario
      exists anywhere in the repository for this mod; the preTest -> done artifacts are
      absent, not merely unexecuted.
  - unverified: never seen running in game; Player.log build-date line, both transpiler
      warnings, the settings UI, EN/FR runtime display and RIMMSQOL integration are
      all unverified.
session:      local_314cf7e0-0763-4b3b-b4b7-03e564331dc5
updated:      2026-09-17, full workflow audit; Source-code link, brrainz.harmony loadAfter, and
              French log lines/source comments (Source, _tools, shipped patch XML) fixed same day
---

# SkillIcons — status

## Workflow audit — 2026-09-17

Audited revision: monorepo HEAD `9a52ea1b5d306fa2dcadcb4305d2aa6fb43c62ac`; no local
modifications under `SkillIcons/` (`git status --short` empty for this path). No standalone
repository exists locally: `git rev-parse --show-toplevel` from inside `SkillIcons/` still
returns the monorepo root, there is no nested `.git`, no `.gitignore` entry for the folder,
and its 2,330 files remain fully tracked in the monorepo's index. This is a first dedicated
audit for this mod; the previous STATUS.md content was the generic 2026-09-12 automatic
sweep record, not a session-verified audit. Read protocols: parent PUBLISHING.md,
STYLE_RIMWORLD.md, MOD_SETTINGS.md and TRANSLATIONS.md. No implementation, image or
distributed binary was changed; the only verification build is under ignored `.build/audit*/`,
removed after use.

**Stage codes for this audit, in order:** `dansMonoRepo`, `horsMonoRepo`, `modIcon`
("ModIcon generated"), `preview` ("Preview generated"), `preOptions`, `options`, `l10n`,
`preTest`, `done`, `tested`. These replace the project's older `stage` vocabulary
(`port`, `showcase`, `preTest`, `done`, `tested`, `published`), which predates this
finer-grained workflow and has no equivalent for "not yet detached."

**Retained stage: `dansMonoRepo`.** The GitHub repository `Rimworld-Skill-Icons` exists and
is public (`gh repo view`), but it is a stale `git subtree split` snapshot last pushed
2026-09-04, matching local branch `skill-icons-export` at `c949a9a`. It is not connected to
any standalone local repository, and `master:SkillIcons` has moved since (last touched
2026-09-12). Per the detachment method on record, a mod only reaches `horsMonoRepo` once its
folder becomes its own `git init` repository with monorepo tracking removed — that step has
not been taken here.

| Transition | Finding |
| --- | --- |
| dansMonoRepo -> horsMonoRepo | **Blocked.** No standalone `.git` root; the folder is still tracked entirely inside the monorepo index. The public GitHub repo exists but is a stale, disconnected export, which is exactly the "not yet detached" case, not a defect in itself. STATUS's own `detached: no` was already accurate. Visibility (public), licence (`original`) and naming are all correctly decided and consistent with the documented reference case for an original creation ([[rimworld-convention-nommage-mods]] cites SkillIcons by name). Root and `Mod/` copies of `ATTRIBUTION.md` and `LICENSE` are byte-identical. |
| horsMonoRepo -> ModIcon generated | Independently validated. Source rebuilds cleanly (`dotnet build -c Release`, 0 warnings/errors); the Release rebuild matches the distributed DLL's size exactly (27,648 bytes); the working tree has zero uncommitted changes. The hash differs only because .NET builds are not byte-deterministic across runs (embedded MVID/timestamp), not because of code drift. `ModIcon.png` directly inspected: 128x128 PNG, 19.1 KB, the documented winking mascot with themed accessory objects, near-black background, matching STYLE_RIMWORLD.md's mascot spec. |
| ModIcon generated -> Preview generated | Independently validated by direct inspection: `Preview.png` is an 896x504 PNG at 65.4 KB, well under the 1 MB hard limit. Its content is an icon-grid showcase (title, tagline, a hue-sorted passion grid, a monochrome skill/work-type row) rather than a game-camera scene — a legitimate departure given the mod's own content is a UI icon set, not gameplay, and matches the README's documented generation path (`_tools/preview.js` composing directly from the generated SVGs). No concrete camera or palette defect identified; STYLE_RIMWORLD.md's scene-camera block does not apply to this kind of preview. |
| Preview generated -> preOptions | Validated. **Corrected 2026-09-17:** the `<description>` in `Mod/About/About.xml` now ends, after the Oracle credit line, on `[url=https://github.com/vbardales/Rimworld-Skill-Icons]Source code on GitHub[/url]`, which PUBLISHING.md names explicitly as mandatory for this gate, publication-independent. Naming convention validated: bare name, no prefix/suffix, `nelim.skillicons`, `Rimworld-Skill-Icons`, `<author>Nelim</author>` with no role suffix — this is the documented reference case for an original creation. No accent/secondary colour confusion identified in the preview as shipped. |
| preOptions -> options | **Partial.** `DoSettingsWindowContents`/`SettingsCategory` exist and read soundly from source: ten Scribe-persisted fields, all defaults declared, numeric fields clamped in `ExposeData`, every label/tooltip routed through `.Translate()`, a live animated gallery. Defect: no `MainButtonDef` exists anywhere in the mod (`MainButton`, `buttonVisible`, `MainTabWindow` all absent from a full-repo search) — MOD_SETTINGS.md requires a hidden shortcut whenever useful settings exist, and they clearly do here. No technical or functional test of this settings page has been executed (no automated harness exists at all — see preTest below), so MOD_SETTINGS.md's §4 checklist is unexercised beyond source reading. |
| options -> l10n | Resource checks pass independently: both `Languages/*/Keyed/SkillIcons.xml` hold exactly the same 25 keys, non-empty in both languages, and match the 25 distinct `.Translate()` call sites in `SkillIconsMod.cs` exactly (no missing key, no unused key, no hardcoded `Widgets.Label` string). The two DefInjected-eligible fields touched by this mod's own patches (`AS_NudistPassion_Active.description`, `AS_PainDrivenPassion_Active.label`) needed no French override: Alpha Skills ships no French language folder at all, so English is the only text any player sees there regardless of interface language — checked directly against the installed Alpha Skills mod. **Corrected 2026-09-17:** the four `Log.Message`/`Log.Warning` calls, previously in French against TRANSLATIONS.md's technical-logs-in-English rule, are now English; rebuilt and reverified clean. Formal `localization`/`translation_en`/`translation_fr` stay `partial`: MOD_SETTINGS.md gates their completion on `settings_audit` being `complete` or `not_applicable`, which it is not yet. |
| l10n -> preTest | All three declared dependencies' packageIds (`brrainz.harmony`, `vanillaexpanded.skills`, `sarg.alphaskills`) verified correct against the real installed mods, as are the two optional integrations named in `loadAfter` (`oracle.skills.retexture`, and `Splot.MiscPawnBadgeRevitalized` read at runtime through `ContentFinder` with silent fallback — correctly *not* a modDependency). All six patch-targeted defNames and all four patch-referenced texture paths were confirmed present in the actual installed Alpha Skills/VSE packages and on disk. `Check-XmlFields.ps1` and `Check-DefRefs.ps1` both ran clean against `Mod/`, before and after the correction below. **Corrected 2026-09-17:** `brrainz.harmony` is now first in `<loadAfter>`, matching the established convention in this repo for every other audited Harmony-dependent mod (`ForTheOccasion`, `Housebroken` both list it explicitly). Single-version `loadFolders.xml` is consistent with `supportedVersions`. |
| preTest -> done | **Not reached.** No test file of any kind exists in the repository (`find . -iname "*test*"` returns nothing): no functional scenarios, no automated suite, no Gherkin/pickle feature, no XML test. As an independent technical check outside that missing suite, the animation frame-count table was verified: the C# `Specs` dictionary and `_tools/gen.js`'s `SPECS` array agree exactly on all 40 animated texture/frame-count pairs, and all 40 sequences exist on disk with precisely the declared frame counts (920 PNG frames total, matching CHANGELOG's figure) — the documented "counter drift" trap is not present. |
| done -> tested | Not reached; blocked upstream. No functional game session has ever been executed for this mod (STATUS's prior sweep already recorded "never seen running", and nothing here changes that). |

### Settings audit

Ten fields in `SkillIconsSettings` (`enabled`, `speed`, `showNonePassion`, `workTabMode`,
`workTabScale`, `workTabOpacity`, `showSkillIcons`, `showWorkTypeIcons`, `preferBadgeIcons`,
`workTabHeaderMode`) all have a documented concrete use in the README and a
`Scribe_Values.Look` default; five numeric/enum fields are clamped
in `ExposeData` after loading, so a hand-edited or stale save cannot leave them out of range.
Primary access is the native `SettingsCategory`/`DoSettingsWindowContents` contract, which
needs no customization mod. All 24 labels/tooltips/radio options drawn on that page route
through `.Translate()`.

No `MainButtonDef` exists in the mod: a full-repo search for `MainButton`, `buttonVisible`
and `MainTabWindow` returns nothing. MOD_SETTINGS.md requires a hidden-by-default shortcut
whenever useful settings exist, which they do; this is a concrete, fixable gap, not a
justified `not_applicable`.

No runtime test of this page exists: no first-use check, no persistence round trip
(close/reopen, save/reload), no boundary/invalid-input exercise, and no RIMMSQOL or other
customization-mod integration test. These observations are from source reading only.

### Translation audit

Inventory: the settings page's checkbox/slider/radio labels and tooltips, plus the gallery
hint, covered by 25 Keyed entries per language, all confirmed non-empty and matching the 25
`.Translate()` call sites in `SkillIconsMod.cs` one-to-one. `def.LabelCap` and
`def.FullDescription`, read in the settings gallery, are native `PassionDef` fields owned by
VSE/Alpha Skills/vanilla, outside this mod's translation duty. The two patched English Def
fields need no French DefInjected override because Alpha Skills ships no French language
folder at all (checked directly against the installed mod), so nothing regresses in French.

**Corrected 2026-09-17:** the four `Log.Message`/`Log.Warning` diagnostic lines (build-date
stamp, both transpiler failure warnings, the missing-`DoHeader` warning) were in French,
against TRANSLATIONS.md's technical-logs-in-English rule; all four are now English, and the
rebuilt DLL matches (0 warnings/errors, same source otherwise unchanged).

**Corrected 2026-09-17, same pass:** source comments in all four `.cs` files, in
`_tools/gen.js`, in `_tools/preview.js`, `_tools/build.sh` and `_tools/audit-teintes.ps1`
(the last written without accents, which is why it did not show up in the initial
accented-character grep), and in the two shipped `Mod/1.6/Patches/*.xml` files were
overwhelmingly in French, against PUBLISHING.md's mandatory English-for-code-comments rule,
applicable "public ou privé." The two XML patch files ship directly to players and to any
future Steam Workshop upload. All were translated to English; identifiers, variable/function
names and the SVG-generation mode-name string literals in `gen.js`'s `SPECS` table were left
untouched (translating those carries functional risk for no requested benefit). Verified by
a full re-scan for accented French characters (zero hits) and a targeted keyword scan for
common unaccented French words inside comment lines (zero genuine hits; remaining matches
were French identifiers like `teinte`, `icone`, `Resoudre`, left alone by design). A
code-only diff (stripping trailing `//` comments) against the prior revision confirmed no
functional code changed in any of these files, and `node --check`/`bash -n` passed on the
JS/shell files.

### Executed checks

- `gh repo view vbardales/Rimworld-Skill-Icons --json ...` and `git ls-remote skill-icons main`:
  public, pushed 2026-09-04, matches local `skill-icons-export` at `c949a9a`.
- `git rev-parse --show-toplevel` from `SkillIcons/`: resolves to the monorepo root; no
  nested `.git`; `git ls-files SkillIcons/ | wc -l` = 2,330, matching the on-disk file count.
- `dotnet build _tools/animation-source/Source/SkillIcons/SkillIcons.csproj --no-restore
  -t:Rebuild -c Release -p:OutputPath=<scratch>`: succeeded, 0 warnings/errors; output size
  27,648 bytes, identical to the distributed DLL; hash differs (non-deterministic build
  metadata only). Scratch output removed after comparison.
- PNG dimensions/sizes read with `System.Drawing`; both `ModIcon.png` and `Preview.png`
  actually viewed. No image was generated or edited.
- `scripts/Check-XmlFields.ps1 -ModPath SkillIcons\Mod`: 4 files checked, no unknown fields.
- `scripts/Check-DefRefs.ps1 -ModPath SkillIcons\Mod`: all XML well-formed, no unresolved
  def references, all `ParentName`s resolved (the mod declares no defs of its own).
  `Class=` usages listed for manual review, all five accounted for as this mod's own patches.
- `grep`/`gh`/direct file reads against the installed Alpha Skills (`3448953006`), Vanilla
  Skills Expanded (`3400246558`), Harmony (`2009463077`), Oracle's Skill Icon Retextures
  (`3214465250`) and Pawn Badge (`3524906267`) Workshop folders: confirmed every declared
  packageId, every patch-targeted defName, and the four patch-referenced texture paths.
- Programmatic diff of the C# `Specs` table against `_tools/gen.js`'s `SPECS` array (40
  entries each) and against the actual `Mod/1.6/Textures/Passions/Animated/` file counts:
  exact match on all 40 sequences, 920 files total.
- Full-repo search for `MainButton|buttonVisible|MainTabWindow` and for any `*test*` file:
  both empty.
- **2026-09-17, translation pass:** `node --check _tools/gen.js` and `_tools/preview.js`,
  `bash -n _tools/build.sh`: all pass. A code-only diff (trailing `//` comments stripped)
  against the prior git revision showed no line changed outside comments and
  `console.log`/`Log.Warning`/`Log.Message`/`throw new Error` message text, for every touched
  file. `Check-XmlFields.ps1`/`Check-DefRefs.ps1` re-ran clean after the patch XML comments
  changed. `dotnet build -c Release`: 0 warnings/errors, DLL/PDB redistributed.

### Next transition and separate follow-ups

**Strict next step (dansMonoRepo -> horsMonoRepo):** detach the folder into its own
repository following the recorded method — `git init -b main`, point `origin` at the
existing `Rimworld-Skill-Icons` GitHub repo, `git fetch` and compare trees (`master:SkillIcons`
vs the remote tip) to decide between a clean `reset --mixed FETCH_HEAD` and a replay, then
remove the folder from the monorepo's tracked index and add the `.gitignore` line. This audit
does not perform that step; it is a git operation with shared-repository consequences, not a
verification.

Independent of that gate, and not requiring detachment first, still open: add a hidden
`MainButtonDef` settings shortcut; correct the stale texture/frame/silhouette counts in
README's Development section; and write the functional/automated/Gherkin/XML test scenarios
this mod currently has none of.

**Corrected 2026-09-17, on request, outside the audit itself:**

- The mandatory Source-code link was added to `About.xml`'s description, and
  `brrainz.harmony` was added to `<loadAfter>` (first entry). `Check-XmlFields.ps1` and
  `Check-DefRefs.ps1` re-ran clean after both edits.
- The four French `Log.Message`/`Log.Warning` lines were translated to English, and the
  source comments across all four `.cs` files, `_tools/gen.js`, `_tools/preview.js`,
  `_tools/build.sh`, `_tools/audit-teintes.ps1` and the two shipped patch XML files were
  translated to English. The distributed DLL/PDB were rebuilt (Release, 0 warnings/errors)
  to match. No image or other binary was touched.

## Historical record (retained)

Read by a sweep across every mod, rather than by asking each thread in turn. It lives at the
root, never inside `Mod/`, so Steam never receives it.

The fields above were read off the disk on 2026-09-12. Four cannot be, and wait for whoever
holds this mod:

- **`stage`** — one of `port`, `showcase`, `preTest`, `done`, `tested`, `published`. Filled in
  from the session group where one exists; confirm it.
- **`tested_on`** — the date of the last run in game. Empty means never.
- **`dependencies`** — `declared` when every mod this one needs is named in the About's
  `modDependencies`, `to check` when a non-vanilla `loadAfter` suggests a dependency that is not
  declared, `none` when the mod needs nothing. An undeclared dependency is not cosmetic: on
  2026-09-11 Reequilibrage animaux took 47 vanilla animals down with it, Muffalo included, because
  the class it injects belongs to a mod that was not declared and not loaded.
- **`remaining`** — what is left, in three kinds: `feature` for something missing from a first
  release, `defect` for a known fault left unfixed, `unverified` for what could not be checked.
  The line already there is true of nearly the whole repository; replace it once it stops being.

`licence` vocabulary: `open` an explicit licence, `silent` no licence and a dead source,
`alive` no licence but a living source, `forbidden` a written refusal, `original` owing nothing
to anyone — not a name, not an idea traceable to one mod, not a value derived from its assets.
