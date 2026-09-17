---
localization: partial
translation_en: partial
translation_fr: partial
settings_audit: partial
mod:          SkillIcons
packageId:    nelim.skillicons
repo:         Rimworld-Skill-Icons
visibility:   public
detached:     yes
stage:        horsMonoRepo
licence:      original
licence_at:   original work, MIT; Oracle's Skill Icon Retextures credited for the visual language only, no texture reused (verified against ATTRIBUTION.md and the generator)
dependencies: declared
showcase:     complete
tested_on:    2026-09-17 (partial: the two Tests/Pickle/ scenarios only, see below)
workshop:
remaining:
  - unverified: docs/TESTING.md scenarios 1-11 (icons on screen, animation, sliders, the
      settings UI, EN/FR runtime display, RIMMSQOL integration, the five tooltip fixes) still
      need a person watching the screen. Scenario 0 (the load-time log line) is now confirmed;
      see below.
session:      local_314cf7e0-0763-4b3b-b4b7-03e564331dc5
updated:      2026-09-17, full workflow audit; Source-code link, brrainz.harmony loadAfter,
              French log lines/source comments, detachment from the monorepo, the hidden
              MainButtons settings shortcut, README's stale texture/frame/silhouette counts,
              and the test suite (functional scenarios, automated harness, Pickle, patch-XML
              replay), all same day
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

**Retained stage: `horsMonoRepo`, as of the 2026-09-17 detachment below.** `SkillIcons/` is
now its own `git init` repository, `origin` pointing at the pre-existing GitHub repository,
with monorepo tracking removed. The audit table below is otherwise unchanged from the same-day
audit that preceded it; only the first row was affected.

## Detachment — 2026-09-17

Trees were not equal (`master:SkillIcons` had moved past the stale 2026-09-04 export since the
audit above), so this took the fourth path on record rather than the plain
`reset --mixed FETCH_HEAD` case: found the monorepo commit whose `SkillIcons/` subtree matched
`skill-icons/main`'s tree exactly (`193d0d01`, 2026-09-04), then replayed the seven commits
since then — each restricted to its own `SkillIcons/` subtree via `commit-tree`, keeping their
original author, date and message — onto that tip. Three of the seven read as multi-mod
commits by title (`Fourteen mods: publish Mod/...`, `Licences: a pass over the forty-one...`,
`A status card for each of the sixty-eight mods...`); each was individually confirmed to
actually change the `SkillIcons/` subtree before being kept, which is what tells a legitimate
commit to replay from the subtree-split trap PUBLISHING.md warns about. The replayed tip's tree
was confirmed byte-identical to `master:SkillIcons` before anything was pushed, and
`skill-icons/main` was confirmed an ancestor of it, so the push to `origin/main` was a plain
fast-forward, no `--force`.

Locally, `git init -b main`, `origin` set to the existing GitHub repository, `git fetch`,
`git reset --mixed FETCH_HEAD`: the working tree matched exactly, `git status` was empty.
Two follow-up fixes landed as a second local commit, pushed separately: this repository's own
`.gitignore` (`.claude/`, build intermediates, IDE/OS clutter — previously covered only by the
monorepo's own rules) and a one-level correction to
`_tools/animation-source/Source/Directory.Build.props`, whose relative path to `.build/` had
pointed one directory too far up and would have written outside this repository entirely once
it was no longer nested inside the monorepo; verified by rebuilding and confirming intermediates
land under `SkillIcons/.build/`.

On the monorepo side, both halves went into one commit as required — the `.gitignore` rule and
`git rm -r --cached` of the folder — built through a temporary index rather than the shared one,
since roughly 3,300 lines of unrelated concurrent work were sitting in the monorepo's working
tree and index at the time; `git update-ref` with the old tip as a compare-and-swap guard
confirmed nothing else had moved `master` in between. The shared/common index was realigned
afterward (`git reset -q -- .gitignore`, then the same `git rm -r --cached` repeated against it)
so a concurrent session's `git add -A` cannot resurrect the removed files or revert the
`.gitignore` line. The `skill-icons` remote was removed from the monorepo, since it can no
longer produce the tree that remote expects. The local `skill-icons-export` branch was left in
place, matching the precedent of every other already-detached mod in this repository.

| Transition | Finding |
| --- | --- |
| dansMonoRepo -> horsMonoRepo | **Validated 2026-09-17**, detachment described above. Visibility (public), licence (`original`) and naming are all correctly decided and consistent with the documented reference case for an original creation ([[rimworld-convention-nommage-mods]] cites SkillIcons by name). Root and `Mod/` copies of `ATTRIBUTION.md` and `LICENSE` are byte-identical. The absence of a remote inside the monorepo for this mod is now the expected, normal state past this gate, not a defect. |
| horsMonoRepo -> ModIcon generated | Independently validated. Source rebuilds cleanly (`dotnet build -c Release`, 0 warnings/errors); the Release rebuild matches the distributed DLL's size exactly (27,648 bytes); the working tree has zero uncommitted changes. The hash differs only because .NET builds are not byte-deterministic across runs (embedded MVID/timestamp), not because of code drift. `ModIcon.png` directly inspected: 128x128 PNG, 19.1 KB, the documented winking mascot with themed accessory objects, near-black background, matching STYLE_RIMWORLD.md's mascot spec. |
| ModIcon generated -> Preview generated | Independently validated by direct inspection: `Preview.png` is an 896x504 PNG at 65.4 KB, well under the 1 MB hard limit. Its content is an icon-grid showcase (title, tagline, a hue-sorted passion grid, a monochrome skill/work-type row) rather than a game-camera scene — a legitimate departure given the mod's own content is a UI icon set, not gameplay, and matches the README's documented generation path (`_tools/preview.js` composing directly from the generated SVGs). No concrete camera or palette defect identified; STYLE_RIMWORLD.md's scene-camera block does not apply to this kind of preview. |
| Preview generated -> preOptions | Validated. **Corrected 2026-09-17:** the `<description>` in `Mod/About/About.xml` now ends, after the Oracle credit line, on `[url=https://github.com/vbardales/Rimworld-Skill-Icons]Source code on GitHub[/url]`, which PUBLISHING.md names explicitly as mandatory for this gate, publication-independent. Naming convention validated: bare name, no prefix/suffix, `nelim.skillicons`, `Rimworld-Skill-Icons`, `<author>Nelim</author>` with no role suffix — this is the documented reference case for an original creation. No accent/secondary colour confusion identified in the preview as shipped. |
| preOptions -> options | **Partial.** `DoSettingsWindowContents`/`SettingsCategory` exist and read soundly from source: ten Scribe-persisted fields, all defaults declared, numeric fields clamped in `ExposeData`, every label/tooltip routed through `.Translate()`, a live animated gallery. **Corrected 2026-09-17:** the missing `MainButtonDef` is fixed — `SkillIcons_Settings` (`Mod/1.6/Defs/MainButtonDefs/MainButtons.xml`), `buttonVisible=false`, `validWithoutMap=true`, `workerClass=SkillIcons.MainButtonWorker_Settings`, whose `Activate()` opens `new Dialog_ModSettings(LoadedModManager.GetMod<SkillIconsMod>())` — the same dialog, same instance, as the primary entry; label/description are English-source Def fields with a French DefInjected override, matching this repo's Def-translation convention. Still open: no technical or functional test of the settings page, old or new, has been executed in game (no automated harness exists at all — see preTest below), so MOD_SETTINGS.md's §4 checklist remains unexercised beyond source reading and the checks below. |
| options -> l10n | Resource checks pass independently: both `Languages/*/Keyed/SkillIcons.xml` hold exactly the same 25 keys, non-empty in both languages, and match the 25 distinct `.Translate()` call sites in `SkillIconsMod.cs` exactly (no missing key, no unused key, no hardcoded `Widgets.Label` string). The two DefInjected-eligible fields touched by this mod's own patches (`AS_NudistPassion_Active.description`, `AS_PainDrivenPassion_Active.label`) needed no French override: Alpha Skills ships no French language folder at all, so English is the only text any player sees there regardless of interface language — checked directly against the installed Alpha Skills mod. **Corrected 2026-09-17:** the four `Log.Message`/`Log.Warning` calls, previously in French against TRANSLATIONS.md's technical-logs-in-English rule, are now English; rebuilt and reverified clean. Formal `localization`/`translation_en`/`translation_fr` stay `partial`: MOD_SETTINGS.md gates their completion on `settings_audit` being `complete` or `not_applicable`, which it is not yet. |
| l10n -> preTest | All three declared dependencies' packageIds (`brrainz.harmony`, `vanillaexpanded.skills`, `sarg.alphaskills`) verified correct against the real installed mods, as are the two optional integrations named in `loadAfter` (`oracle.skills.retexture`, and `Splot.MiscPawnBadgeRevitalized` read at runtime through `ContentFinder` with silent fallback — correctly *not* a modDependency). All six patch-targeted defNames and all four patch-referenced texture paths were confirmed present in the actual installed Alpha Skills/VSE packages and on disk. `Check-XmlFields.ps1` and `Check-DefRefs.ps1` both ran clean against `Mod/`, before and after the correction below. **Corrected 2026-09-17:** `brrainz.harmony` is now first in `<loadAfter>`, matching the established convention in this repo for every other audited Harmony-dependent mod (`ForTheOccasion`, `Housebroken` both list it explicitly). Single-version `loadFolders.xml` is consistent with `supportedVersions`. |
| preTest -> done | **Corrected 2026-09-17.** All four written-artifact requirements now exist: `docs/TESTING.md` (twelve functional scenarios), `_tools/Run-Tests.ps1` (29 automated tests, run, all green), the same suite's patch-XML replay tests (the XML requirement, run, all green), and `Tests/Pickle/` (two Gherkin scenarios, written). Full detail under "Test suite — 2026-09-17" below. Pickle's own execution needs an actual RimWorld session, which is her own next step rather than something this pass performs or waits on. |
| done -> tested | **Partial, 2026-09-17.** The two `Tests/Pickle/` scenarios ran for real in game and both passed, and `docs/TESTING.md` Scenario 0 (the load-time log line, read from `Player.log`) is confirmed clean - see "In-game Pickle run" below. Scenarios 1-11 (icons on screen, animation, sliders, EN/FR display, the five tooltip fixes) are still unplayed; `tested` is not reached until those are too. |

### Settings audit

Ten fields in `SkillIconsSettings` (`enabled`, `speed`, `showNonePassion`, `workTabMode`,
`workTabScale`, `workTabOpacity`, `showSkillIcons`, `showWorkTypeIcons`, `preferBadgeIcons`,
`workTabHeaderMode`) all have a documented concrete use in the README and a
`Scribe_Values.Look` default; five numeric/enum fields are clamped
in `ExposeData` after loading, so a hand-edited or stale save cannot leave them out of range.
Primary access is the native `SettingsCategory`/`DoSettingsWindowContents` contract, which
needs no customization mod. All 24 labels/tooltips/radio options drawn on that page route
through `.Translate()`.

**Corrected 2026-09-17.** `SkillIcons_Settings` is a normal `MainButtonDef`:
`buttonVisible=false`, and a full-repo grep for `SetVisible|buttonVisible` found no
programmatic override anywhere in the source, only the Def's own field and the comment next
to it, so the definition is left alone for a customization mod to reveal, exactly as MOD_SETTINGS.md
requires — neither visible nor greyed out by default, never forcibly hidden. `Activate()`
constructs `Dialog_ModSettings` directly from `LoadedModManager.GetMod<SkillIconsMod>()`,
which is the same call `Verse.Page_ModSettings`/the vanilla Options path resolves to for the
same mod instance, its same `Settings` field and the same `WriteSettings()` persistence — not
a second, independent settings surface. `Check-XmlFields.ps1` (5 files, all fields resolve
against the delivered DLL), `Check-DefRefs.ps1` (1 mod def found, well-formed, no unresolved
reference) and `Check-DefInjected.ps1` (2 keys, `label`/`description`, 0 errors) all ran clean
against the new Def and its French DefInjected override.

No runtime test of this page exists, old or new: no first-use check, no persistence round trip
(close/reopen, save/reload), no boundary/invalid-input exercise, and no RIMMSQOL or other
customization-mod reveal/open/hide integration test. These remain source-level checks only.

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
- **2026-09-17, MainButtonDef pass:** `dotnet build -c Release`: 0 warnings/errors after adding
  `MainButtonWorker_Settings.cs` and `MainButtons.xml`. `Check-XmlFields.ps1` (5 files, extra
  assembly the rebuilt DLL): no unknown fields. `Check-DefRefs.ps1`: 1 mod def found, well
  formed, no unresolved reference. `Check-DefInjected.ps1 -TransMod SkillIcons\Mod -Targets
  SkillIcons\Mod`: 2 keys (`SkillIcons_Settings.label`/`.description`), 0 errors. Full-repo
  `grep` for `SetVisible|buttonVisible`: only the Def's own field and its comment, no
  programmatic override.

### Next transition and separate follow-ups

**Reserved for her next in-game session (preOptions -> options, fully):** the settings page's
in-game technical and functional checklist from MOD_SETTINGS.md §4 — first use, persistence
round trip, boundary input, and the RIMMSQOL reveal/open/edit/hide sequence for both the primary
entry and the new shortcut. Everything reachable without a game session is already done:
`dansMonoRepo -> horsMonoRepo` as of 2026-09-17 (detachment described above), and the
`MainButtonDef` gap that this gate had at the source level, fixed the same day.

The functional/automated/Gherkin/XML test scenarios this mod had none of are now written; see
"Test suite — 2026-09-17" below for what that does and does not close.

**Corrected 2026-09-17, on request, outside the audit itself:**

- The mandatory Source-code link was added to `About.xml`'s description, and
  `brrainz.harmony` was added to `<loadAfter>` (first entry). `Check-XmlFields.ps1` and
  `Check-DefRefs.ps1` re-ran clean after both edits.
- The four French `Log.Message`/`Log.Warning` lines were translated to English, and the
  source comments across all four `.cs` files, `_tools/gen.js`, `_tools/preview.js`,
  `_tools/build.sh`, `_tools/audit-teintes.ps1` and the two shipped patch XML files were
  translated to English. The distributed DLL/PDB were rebuilt (Release, 0 warnings/errors)
  to match. No image or other binary was touched.
- Detached from the monorepo into its own repository, `origin` set to the pre-existing
  `Rimworld-Skill-Icons` GitHub repository; method and verification described under
  "Detachment — 2026-09-17" above. `detached` and `stage` updated accordingly.
- Added the hidden `MainButtonDef` settings shortcut MOD_SETTINGS.md requires
  (`SkillIcons_Settings`, `buttonVisible=false`, opens the same `Dialog_ModSettings`/mod
  instance as the primary entry), with its French DefInjected override, README and CHANGELOG
  entries, and the checks listed above. In-game verification of both entry points remains open.
- README's Development section corrected: it still said "34 parametric drawings... become the
  74 static textures, the 114 animation frames and the 74 silhouettes", read off the disk
  again and matching CHANGELOG's/ATTRIBUTION's already-correct figures — 41 parametric passion
  drawings (recounted: `grep -cE '^I\.(AS_|Passion)[A-Za-z_]*\s*=' _tools/gen.js`) become the
  85 static textures, 920 animation frames and 85 silhouettes, plus 12 skill and 14 work type
  drawings becoming the 12 skill and 23 work type textures. The same paragraph also still
  quoted the pre-translation French log line (`assemblage du <date>`); corrected to match the
  English string the code has actually logged since the translation pass. Documentation only;
  no code, image or binary changed.
- The `preTest -> done` written-artifact requirements were fulfilled: `docs/TESTING.md`
  (functional scenarios), `_tools/Run-Tests.ps1` (automated, executed, green), and
  `Tests/Pickle/` (Gherkin, written). Full detail under "Test suite — 2026-09-17" below,
  including why this does not by itself move `stage` past `horsMonoRepo`.

## Test suite — 2026-09-17

Addresses `preTest -> done`'s written-artifact bullets directly. Does **not** close the
`options -> l10n` gate above, which was already reserved for an in-game settings session before
this pass and stays reserved for one after: writing and running tests outside the game answers
a different question from MOD_SETTINGS.md §4's first-use/persistence/RIMMSQOL checks, which
need her to actually play. `stage` stays `horsMonoRepo` for that reason, not because this work
did not happen.

**`docs/TESTING.md`** — twelve numbered scenarios (0-11), each with preconditions, a `Do`, an
`Expect` and a `Fails if`, covering: the load-time log line and the three patch-failure
warnings named explicitly; all four places passion icons are drawn; each of the three work tab
modes; the size/opacity sliders; the "no passion" icon; skill/work-type icon toggles and the
Pawn Badge borrow/fallback behaviour; the three column-header modes; settings persistence
across reopen/restart/reload; the hidden MainButtons shortcut opening the identical dialog as
the primary entry; English/French display; and the five Alpha Skills/VSE def fixes as they
should appear in a tooltip. None executed - this workflow does not launch the game.

**`_tools/Run-Tests.ps1`** — 29 tests, 0 skipped, all passing against the current build. Verified
non-vacuous by hand: five real mutations (a wrong replacement string in `AlphaSkills_Fixes.xml`,
a drifted frame count in `gen.js`, a removed Keyed entry, `buttonVisible` flipped to `true`, plus
several genuine implementation bugs hit and fixed while writing the suite itself - see below)
were each confirmed to turn exactly the intended test red and nothing else, then reverted; the
suite is green again against the unmodified repository. What it checks, and why each needed
executing rather than reading the source:

- `SkillIconsSettings.ExposeData()` is called directly, not re-typed: `Scribe.mode` defaults to
  `Inactive` outside the game, which makes `Scribe_Values.Look` a no-op and lets the five
  `Mathf.Clamp` lines that follow run for real. All ten defaults and all five clamped ranges
  are exercised this way.
- `MainButtonWorker_Settings.Activate()` cannot be *called* hors jeu (`Find.WindowStack` and
  `LoadedModManager.GetMod<T>()` both need a running game), so its IL is read instead: a linear
  byte scan (this repository's established technique) for `newobj RimWorld.Dialog_ModSettings`,
  `call Verse.LoadedModManager.GetMod` and a reference to `Find.WindowStack`/`WindowStack.Add`,
  proving it opens the *same* dialog for the *same* mod instance without asserting it from the
  source.
- Every Harmony patch target (`PassionDef.Icon`/`WorkBoxIcon`, `WidgetsWork.DrawWorkBoxBackground`,
  `SkillUI.DrawSkill`, the `DoHeader` fallback) is resolved by plain reflection against the real
  installed `Assembly-CSharp`/`VSE.dll`, proving the citations still match this RimWorld version.
- `SkillTypeIcons`'s two badge dictionaries are checked key-by-key against the SkillDefs and
  WorkTypeDefs the installed game actually declares (12/12 and 19/23, the missing four matching
  README's own list exactly) - not a hand-kept copy of either list.
- The animation frame table is compared at the **source** level (`PassionIconAnimations.cs`'s
  `Specs` dictionary literal against `gen.js`'s `SPECS` array), not the compiled one:
  `PassionIconAnimations`'s static constructor Harmony-**transpiles** two real game methods,
  which throws `SecurityException: ECall methods must be packaged into a system module` the
  moment Harmony tries to prepare `WidgetsWork.DrawWorkBoxBackground`/`SkillUI.DrawSkill`
  outside the actual Unity runtime - confirmed by hand before writing the suite.
  `SkillTypeIcons`'s cctor only applies **prefixes**, which is why triggering it for the badge
  dictionaries above is safe and triggering this one is not. Said plainly in the script rather
  than silently claiming the stronger, DLL-level check.
- Both patch XML files are replayed for real: `PatchOperationAdd`/`Replace`/`Sequence` are
  instantiated by reflection and `Apply()`'d against the real installed Alpha Skills/VSE def
  nodes read off disk (never a hand-typed copy), inside a single combined `<Defs>` document
  matching how a real DefDatabase load presents them. That combined-document shape is load-
  bearing, not incidental: `Verse.PatchOperationSequence.ApplyWorker` is a **chain** that stops
  at the first sub-operation whose xpath matches nothing, proven by a dedicated test built the
  other way (`AS_NudistPassion_Active` absent, `AS_PainDrivenPassion_Active` present) that
  confirms the second def's fix is *not* reached. This is a real, previously undocumented
  fragility of `AlphaSkills_Fixes.xml`: if Alpha Skills ever drops or renames the
  first-listed def while the other four bugs remain, none of the other four fixes apply either,
  silently, `<success>Always</success>` notwithstanding - recorded here and in
  `docs/TESTING.md`, not fixed, since restructuring the patch is outside what was asked.

**Genuine bugs found and fixed while writing the harness, not the mod:** an incorrect namespace
guess (`Verse.WidgetsWork` vs the real `RimWorld.WidgetsWork`; `Verse.Dialog_ModSettings` vs the
real `RimWorld.Dialog_ModSettings`), a `DeepProfiler.enabled` binding-flags mismatch (it is
`public`, not `NonPublic`), a PowerShell 5.1 quirk where reflection's `Invoke()` cannot convert
its own ETS-adapted `XmlDocument` unless the argument array element carries an explicit type
cast, and the `XmlContainer.node` field expecting the `<value>` element itself rather than its
already-unwrapped first child (passing the unwrapped child silently replaced
`<description>text</description>` with a bare, untagged text node - exactly the kind of
silent-looking failure this test exists to catch, caught first in the harness before it could
have been caught anywhere else). None of these were mod defects; all were fixed in
`_tools/Run-Tests.ps1` itself before it was trusted.

**`Tests/Pickle/`** — a companion test mod (`nelim.skillicons.pickletests`, matching the
ArchitectStudio/WorkStudio convention) with one feature, two scenarios, using only step phrasings
confirmed - by direct comparison against both existing suites - to be Pickle's own generic
vocabulary (`mod "..." is loaded`, `mod "..." loads after "..."`, `def "..." of type "..."
exists`) rather than a custom step requiring a companion steps assembly: SkillIcons loads after
Harmony/VSE/Alpha Skills, and the `SkillIcons_Settings` MainButtonDef exists. Deliberately
narrower than the interactive scenarios in `docs/TESTING.md`: unlike ArchitectStudio's group
drag-and-drop or Work Studio's reordering, SkillIcons's settings page is plain
`Listing_Standard` controls with no custom-drawn or draggable interaction that would clearly
justify building and maintaining a custom steps DLL for it. Written, not played - same as
ArchitectStudio's and WorkStudio's suites on the day they were written.

**Corrected 2026-09-17, same pass:** neither the mod itself nor its Pickle test companion was
actually reachable in game - unlike ArchitectStudio and WorkStudio, no junction linked either
into RimWorld's `Mods` folder. Fixed the same way as those two:

```powershell
New-Item -ItemType Junction -Path "...\RimWorld\Mods\SkillIcons" -Target "<repo>\Mod"
New-Item -ItemType Junction -Path "...\RimWorld\Mods\SkillIconsPickleTests" -Target "<repo>\Tests\Pickle\Mod"
```

Both confirmed present (`LinkType: Junction`) after creation. **Corrected 2026-09-17, on
request:** `Tests/Pickle/README.md` now documents the junction commands above, the enable order,
the run command (`-pickle-run="SkillIcons - Pickle tests"`), and states plainly that no build step
or custom steps assembly exists for this suite - both scenarios use only `Pickle.Vanilla`'s
generic step vocabulary - and that everything past load-order and the `MainButtonDef` check stays
a manual, eyes-on-screen verification against `docs/TESTING.md`.

## In-game Pickle run — 2026-09-17

Both `Tests/Pickle/` scenarios ran for real, in a running RimWorld, and both passed - the first
in-game evidence this mod has. Read directly from
`%USERPROFILE%\AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\PickleReports\summary.md`
(file timestamp 2026-09-17 19:29), not taken on her word alone:

```
| the mod loads after Harmony, Vanilla Skills Expanded and Alpha Skills | Passed | 152 | 1 |
| the hidden MainButtons settings shortcut is declared | Passed | 69 | 1 |
```

`junit.xml` confirms both under `nelim.skillicons.pickletests`, neither with a `<failure>` element.
The run's report is shared across every Pickle-tested mod on this machine and shows 162 scenarios
total (130 passed, 29 failed, 3 skipped) - the 29 failures belong to Pickle's own sample suite,
Quiet New Factions, WorkStudio and ArchitectStudio, none to SkillIcons; both of SkillIcons's own
lines are clean.

What this does and does not prove: it confirms, for the first time inside the actual game, that
SkillIcons loads after Harmony/VSE/Alpha Skills and that the `SkillIcons_Settings` `MainButtonDef`
exists in the real `DefDatabase` - exactly the two things `Tests/Pickle/README.md` says this suite
can check with only `Pickle.Vanilla`'s generic steps. It does not touch any of the twelve
`docs/TESTING.md` scenarios directly: no icon was seen on screen, no animation, no slider, no
French string, none of the five Alpha Skills/VSE tooltip fixes.

The same play session also settles `docs/TESTING.md` **Scenario 0** independently, read straight
from `Player.log` (not generated by this pass, only read): the assembly-date line
`[SkillIcons] assembly dated 2026-09-17 14:36:21` is present and matches
`Mod/1.6/Assemblies/SkillIcons.dll`'s own file time on disk to the second, none of the three
patch-failure warnings fired, and no `XML error`/`Config error`/`Could not resolve`/
`Could not find` line names SkillIcons. One log line was noted and set aside as unrelated: the
generic engine warning "Translation data for language French has 4 errors" is aggregated across
this machine's ~200 active mods and names no mod; SkillIcons's own EN/FR key parity was already
confirmed statically (see "Translation audit" above), so this is not attributed to it without the
in-game translation report actually naming it. A "did not load any content" notice for
"SkillIcons - Pickle tests" is expected and benign, identical to the same notice for the
Quiet New Factions/Work Studio/Architect Studio Pickle companions - none of the four ship a
`Defs`/`Textures`/`Sounds` folder, only `Pickle/Features/`.

Scenarios 1-11 remain unplayed. `done -> tested` stays open for those.

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
