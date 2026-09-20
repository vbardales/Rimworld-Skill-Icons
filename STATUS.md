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
stage:        done
licence:      original
licence_at:   original work, MIT; Oracle's Skill Icon Retextures credited for the visual language only, no texture reused (verified against ATTRIBUTION.md and the generator)
dependencies: declared
showcase:     complete
tested_on:    2026-09-20 (docs/TESTING.md scenarios 0, 1, 2, 3, 4, 5, 9 and 11 confirmed in game;
              8 and 10 failed on bugs in the tests themselves, both fixed, neither re-run)
workshop:
remaining:
  - unverified: docs/TESTING.md scenarios 8 and 10. Their 2026-09-20 failures were test bugs, not
      mod defects - the settings sandbox left the static and the Mod's own settings field pointing
      at different objects, and the language step matched "French" against a folder actually named
      "French (Français)". Both fixed, neither re-run.
  - unverified: scenario 10 needs a run with aitranslation.pack and seohyeon.autotranslation
      disabled. The second announces a dynamic UI interceptor, which would make the French
      screenshot show its machine translation and the assertions pass against a broken file.
  - unverified: what only a person can still do - a real restart for scenario 8, RIMMSQOL's own
      reveal/hide for 9, the pawn creation screen and whether an animation actually moves for 1.
session:      local_314cf7e0-0763-4b3b-b4b7-03e564331dc5
updated:      2026-09-20, third in-game run: the grey-mode fix confirmed, five more scenarios
              automated and eight now confirmed, two test bugs found and fixed. Earlier:
              2026-09-19, the skill and work type icon set moved to Work Studio and was cut here,
              leaving a passions-only mod; and the second in-game run, where scenario 3 failed
              and was fixed (grey mode was
              overridden by the colour-only animation frames), the settings and Bio tab
              scenarios were repaired and passed, and Screenshots/ was added. Earlier:
              2026-09-17, full workflow audit; Source-code link, brrainz.harmony loadAfter,
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

**Transition labels used in the table below, in order:** `dansMonoRepo`, `horsMonoRepo`,
`modIcon` ("ModIcon generated"), `preview` ("Preview generated"), `preOptions`, `options`,
`l10n`, `preTest`, `done`, `tested`. **These are prose organisation for this audit only, not
the `stage:` front-matter field.** That field has exactly six valid values -
`port`, `showcase`, `preTest`, `done`, `tested`, `published` - and is never held back by
something that needs a running game: launching RimWorld is outside this session's process by
design, and an in-game trial is not a manufacturing stage, it is reported by `tested_on` and
`remaining` instead. **Corrected 2026-09-17, on request:** an earlier revision of this file
wrote the finer table labels directly into `stage:` and left it at the now-invalid
`horsMonoRepo` while waiting on checks this process cannot itself perform - fixed to `stage:
done`, matching the definition above and the precedent already set on `ForTheOccasion`'s own
STATUS.md (`stage: done`, `tested_on:` empty, unplayed scenarios listed under `remaining`).
`done` is accurate here: `SkillIcons/` is its own detached repository, every check achievable
without a game session has passed (see the table below), and the written test artifacts exist.
What is not yet true - the twelve `docs/TESTING.md` scenarios and the `preOptions`/`options`
in-game checklist - is exactly what `remaining` and the partial `tested_on` already say.

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

Nine fields in `SkillIconsSettings` (`enabled`, `speed`, `showNonePassion`, `workTabMode`,
`workTabScale`, `workTabOpacity`, `showSkillIcons`, `showWorkTypeIcons`,
`workTabHeaderMode`) all have a documented concrete use in the README and a
`Scribe_Values.Look` default; five numeric/enum fields are clamped
in `ExposeData` after loading, so a hand-edited or stale save cannot leave them out of range.
Primary access is the native `SettingsCategory`/`DoSettingsWindowContents` contract, which
needs no customization mod. Every label/tooltip/radio option drawn on that page routes
through `.Translate()`.

**Corrected 2026-09-18, on request.** A tenth field, `preferBadgeIcons` ("borrow Pawn Badge
icons when available"), was removed along with the whole *Pawn Badge - (MISC) Job Icons+
Revitalized* integration - see "Pawn Badge integration removed" below. Audit rows dated
2026-09-17 in this file still describe it because it existed then; they are left as written
rather than rewritten after the fact.

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
  `Tests/Pickle/` (Gherkin, written). Full detail under "Test suite — 2026-09-17" below. This is
  what moved `stage` to `done` - see the correction at the top of this file.

## Test suite — 2026-09-17

Addresses `preTest -> done`'s written-artifact bullets directly. Does **not** close the
`options -> l10n` gate above, which was already reserved for an in-game settings session before
this pass and stays reserved for one after: writing and running tests outside the game answers
a different question from MOD_SETTINGS.md §4's first-use/persistence/RIMMSQOL checks, which
need her to actually play. That gap is tracked in `remaining` and the partial `tested_on`, not
by holding `stage` back - see the correction at the top of this file.

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

**Added 2026-09-18, on request - a custom steps assembly, screenshot-only.** She asked for the
manual `docs/TESTING.md` scenarios to be automated where possible rather than clicked through by
hand. `Tests/Pickle/Source/SkillIcons.PickleSteps.csproj` (builds clean, 0 warnings/errors,
independently rebuilt and confirmed here, not just taken from the build log) adds `PassionSteps.cs`
(sets `SkillRecord.passion` directly; grants a real installed `PassionDef`'s Hediff as the honest
limit of forcing a "live" state - it cannot fake Alpha Skills' ~20 HediffComp-driven real-world
trigger conditions, see the file's own header), `SettingsSteps.cs`, `BioTabSteps.cs`, and
`SettingsSandbox.cs` (backs up/restores the real settings file per scenario, matching WorkStudio's
pattern). Five new `@review`-tagged feature files
(`02-settings-defaults` through `06-worktab-headers`) each end in `I take a screenshot "..."` and
assert nothing about pixels - a person, or a later Claude session reading the report's images,
judges. Covers Scenario 2 (settings defaults), Scenarios 1+5 (passion icons, Bio tab and Work tab,
explicitly not the pawn creation screen), Scenario 3 (work tab modes), Scenario 4 (sliders),
Scenario 7 (header modes). Left manual, with reasons recorded in `Tests/Pickle/README.md`'s "what
stays manual" table: the pawn creation screen, Scenario 6 (the icon toggles), Scenario 8 (a real
restart), Scenario 9 (RIMMSQOL), Scenario 10 (no language-switch primitive exists in Pickle's own
sample vocabulary), Scenario 11 (no hover/tooltip primitive either, checked across every shipped
`.feature` file).

Real, stated uncertainty this pass cannot resolve without an actual run: whether `I open the
"Work" tab` reaches the real `RimWorld.MainTabWindow_Work` at all, given the third-party Work tab
replacement already observed on her modlist - the scenarios assert `window "MainTabWindow_Work" is
open` specifically so a mismatch fails loudly instead of silently screenshotting the wrong window.
Nothing here was run; nothing here is claimed to have passed. `tested_on` and `remaining` stay as
they were until she runs it and the resulting `PickleReports/` screenshots are actually read.

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

## Pawn Badge integration removed — 2026-09-18

On request, after she said the whole thing was a misunderstanding. The mod no longer reads
*Pawn Badge - (MISC) Job Icons+ Revitalized*'s textures at runtime and no longer offers the
choice: every skill and work type now always shows this mod's own drawing. Removed, in one pass:

- `SkillTypeIcons.cs`: the `BadgeParCompetence` and `BadgeParTravail` mapping dictionaries and
  the `Resoudre` indirection that consulted them. `Pour(SkillDef)`/`Pour(WorkTypeDef)` now load
  `Skills/<defName>` and `WorkTypes/<defName>` directly.
- `SkillIconsMod.cs`: the `preferBadgeIcons` field, its `Scribe_Values.Look` line and its
  settings checkbox. Nine settings fields remain, five of them still clamped.
- Both `Keyed` files: `SkillIcons.BadgeIcons` and `SkillIcons.BadgeIconsDesc`, EN and FR.
- `Mod/About/About.xml`: the paragraph describing the borrow and the settings-list bullet.
- `ATTRIBUTION.md` and `Mod/ATTRIBUTION.md`: the whole Pawn Badge section, in both copies -
  re-verified byte-identical afterwards.
- `README.md`, `CHANGELOG.md` (the `[1.0.0] — unreleased` entry, edited in place since nothing
  has shipped), `docs/TESTING.md` (Scenario 6 reduced to the two icon toggles, with a note
  recording why its borrow half is gone) and `Tests/Pickle/README.md`'s "what stays manual" row.
- `_tools/Run-Tests.ps1`: the two badge-mapping tests and the `Get-VanillaDefNames` helper only
  they used, plus the `preferBadgeIcons` default expectation. Remaining sections relabelled to
  stay contiguous.

Rebuilt (`dotnet build -c Release`, 0 warnings/errors) and the harness re-run: **27 tests, 0
skipped, all passing**. The translation-coverage test is what proves the removal was consistent
rather than partial - it checks EN/FR key-set parity *and* that every `.Translate()` call site in
the source still has a matching Keyed entry, so an orphaned key or an orphaned call site on
either side would have failed it.

No texture was deleted: this mod always shipped its own complete `Skills/` and `WorkTypes/` sets
(12 and 23), and those are what it now serves unconditionally - the borrow was only ever an
override on top of them, so nothing is left without an icon.

Audit rows and the "Test suite — 2026-09-17" section above still describe the feature and quote
29 tests, because that is what was true when they were written. They are left as written.

## Second in-game run, and a real defect — 2026-09-19

The five screenshot scenarios ran. Four passed; `02-settings-defaults` passed too once the tick
wait was dropped (`Dialog_ModSettings` force-pauses the game, so a tick wait can never satisfy).
The Bio tab capture, obstructed by a log viewer in the first run, came back clean after
`I close all dialogs` was added.

**`docs/TESTING.md` Scenario 3 failed, and the failure was real.** The three work tab mode captures
are the same image. Measured rather than eyeballed, because the icons animate and any two captures
differ a little by default: across the priority grid the three differ by 0.2-0.5% of bytes, and the
counts that would move if Greyed desaturated anything do not - 5045 / 5027 / 5060 red pixels,
0.3208 / 0.3201 / 0.3191 mean saturation. At 6x zoom the same hearts sit in the same cells in all
three.

Two explanations were ruled out before calling it a defect. The harness is not at fault: the steps
write the live static `SkillIconsMod.Settings` that the drawing code reads, through
`Driver.Settings`, which re-reads the field every call. And the patched draw path is not missing:
Scenario 4's sliders act on the same cells through the same path and changed the drawing
dramatically in the same run - minimum gives tiny dim hearts, maximum gives large saturated ones.
Size and opacity worked; the mode alone did nothing.

Cause, in `PassionIconAnimations.cs`: `WorkBoxAnimatedIcon` chose the right texture for the mode -
`Icon` in colour, `WorkBoxIcon` in grey - then passed it to `AnimatedIconOrFallback`, which
discards the texture it is handed whenever the passion has an animation and returns a frame
instead. Every frame is drawn in colour; no grey frame set exists. So for the forty animated
passions all three modes drew the same coloured frame. Fixed by giving that helper an `animate`
flag and passing `false` on the grey path: an asleep bonus now draws its static grey icon and does
not animate, which also reads better than a grey icon in motion. Rebuilt clean, harness still 27 of
27 - neither of which can see a colour, so **the fix is unverified on screen** and the trio needs
re-shooting.

Note what caught this: not the suite, which is green either way because those scenarios only take
screenshots and assert nothing about pixels. The screenshots caught it, when they were looked at.
That is the design working as intended - and the reason the `@review` tag exists - but it means a
green Pickle run is not evidence for these five scenarios on its own.

`Screenshots/` now holds four crops taken from this run, with a README recording what each shows,
why the mode trio is deliberately absent, and that `01-settings-page.png` will need re-shooting
once the skill/work-type section leaves for Work Studio.

## Skill and work type icons removed — 2026-09-19

On her decision: the whole set moved to Work Studio, which owns work types and was already
designing a per-type icon in its own backlog. Work Studio ported it first (their commit
`5870457`) and confirmed nothing there depends on this tree any more; only then was it cut here.
SkillIcons draws passions only from now on.

Removed: `SkillTypeIcons.cs` with both its Harmony prefixes (`SkillUI.DrawSkill`'s rect-shrinking
prefix and the `PawnColumnWorker_WorkPriority.DoHeader` one), the twelve `Textures/Skills/` and
twenty-three `Textures/WorkTypes/` PNGs, `gen.js` lines 1144-1426 and the two `build.sh`
rasterisation steps that fed them, the three settings fields (`showSkillIcons`,
`showWorkTypeIcons`, `workTabHeaderMode`) with their Scribe lines, clamp and settings-page block,
the eight Keyed entries in both languages, the About/README/CHANGELOG passages, `docs/TESTING.md`
scenarios 6 and 7, `06-worktab-headers.feature` with its step, and the two harness tests tied to
them.

Six settings fields remain, four of them clamped. The harness is **25 of 25**, rebuilt clean. The
translation-coverage test is again what proves the removal was consistent rather than partial: it
checks EN/FR key parity and that every `.Translate()` call site still has a matching Keyed entry,
so an orphan on either side would have failed it.

Two deliberate choices worth recording:

- **`docs/TESTING.md` keeps a gap at 6 and 7** rather than renumbering. This file, that file and
  several commit messages all cite scenarios by number; renumbering would silently invalidate every
  citation. The gap carries a note saying why.
- **Audit rows dated 2026-09-17 still describe the feature**, because it existed then. They are
  left as written, the same treatment the Pawn Badge removal got.

`Screenshots/01-settings-page.png` is now stale — it shows the removed section — and needs
re-shooting once the trio from the Scenario 3 fix is re-shot anyway. Its README already flagged
this.

A `BACKLOG.md` was started for this mod at the same time, with her idea of picking a passion's
drawing by clicking it in the options gallery.

### Translation audit — 2026-09-20

A re-run of TRANSLATIONS.md §1-§3 against the mod as it stands today, passions only, after the
skill and work type icon set left for Work Studio on 2026-09-19. The `### Translation audit`
section dated 2026-09-17 above describes a mod with ten settings fields and twenty-five Keyed
entries; that was true when it was written and is left as written, but it is no longer a
description of this tree. The current figures are six settings fields and fifteen Keyed entries
per language. Nothing in this pass needed fixing: no defect was found in the language files, in
the C# or in the two patch files, which is the honest outcome rather than a manufactured one.

**Inventory (§1).** Every player-facing string this mod owns is drawn by
`SkillIconsMod.DoSettingsWindowContents`: one checkbox and its tooltip for the animation toggle,
the animation speed slider label, one checkbox and its tooltip for the "no passion" icon, the
Work tab section heading, three radio buttons each with a tooltip, the icon size and icon opacity
slider labels, and the gallery hint above the passion grid. That is fifteen distinct strings and
exactly fifteen `.Translate()` call sites, all in `SkillIconsMod.cs`; `PassionIconAnimations.cs`
and `MainButtonWorker_Settings.cs` draw no text at all. Outside the C#, the mod owns the
`SkillIcons_Settings` `MainButtonDef`'s `label` and `description` in
`Mod/1.6/Defs/MainButtonDefs/MainButtons.xml`, English in the Def itself and French in
`Mod/Languages/French/DefInjected/MainButtonDef/MainButtons.xml`, and the two pieces of English
text its patches write onto Alpha Skills' defs, `AS_NudistPassion_Active.description` and
`AS_PainDrivenPassion_Active.label`. `Mod/loadFolders.xml` declares one version, `/` and `1.6`,
so there is no second version folder or conditional folder carrying text that this inventory
would miss; the only other patch values are `workBoxIconPath` and `iconPath` texture paths, which
are internal paths and not translatable.

**What the inventory deliberately excludes, and why.** The settings gallery draws `def.LabelCap`
and `def.FullDescription` for every installed `PassionDef`. Those are native `PassionDef` fields
owned by vanilla, Vanilla Skills Expanded and Alpha Skills; this mod neither declares nor patches
them, it reads whatever the owning mod supplies, so translating them is the owning mod's duty and
an English or French DefInjected file here would be this mod claiming another mod's text. The
sole exception is the two Alpha Skills fields this mod's own patch rewrites, treated below. The
mod's own name, returned literally by `SettingsCategory()` and repeated as the `MainButtonDef`
label in both languages, is a proper name and is deliberately identical in English and French,
which §3 names explicitly as not being a missing translation. The four `Log.Message`/`Log.Warning`
lines in `PassionIconAnimations.cs` and `SkillIconsMod.cs` are technical logs and correctly stay
in English, unchanged. `Mod/About/About.xml`'s description and the repository's Markdown are
PUBLISHING.md's business, not this gate's, and `Tests/Pickle/` is a companion test mod that never
ships to a player.

**Localizability (§2).** No player-facing hardcoded string exists in the C#. A grep across the
three source files for `Widgets.Label`, `listing.Label`, `CheckboxLabeled`, `RadioButton`,
`ButtonText`, `Messages.Message`, `TooltipHandler` and `LetterStack` returns twelve hits, and
every one of them either passes a `.Translate()` result or passes a def field owned by another
mod (`def.LabelCap` at the gallery label, `def.FullDescription` in the tooltip). All fifteen keys
carry the `SkillIcons.` prefix, are literal constants rather than assembled at runtime, and none
builds a sentence out of translated fragments: the three parameterised strings are complete
sentences taking one value each.

**Coverage (§3).** Both Keyed files parse as valid XML and declare the same fifteen keys, with no
duplicate element name in either file and no empty or whitespace-only value. Every French entry
differs from its English counterpart, so there is no entry that is really the English string left
in place; no value contains a TODO, FIXME or other untranslated marker. The parameter check
matches the call sites: `SkillIcons.Speed`, `SkillIcons.WorkTabScale` and
`SkillIcons.WorkTabOpacity` are the only three keys containing `{0}`, they are the only three
`.Translate()` calls that pass an argument, and each passes exactly one. The literal `\n`
sequences agree count for count between the two languages: one in `AnimatedDesc`, two in
`ShowNoneDesc` and two in `WorkTabMixedDesc`, none anywhere else, and no value contains a real
newline character that would behave differently from the escaped form.

Stronger than the source-level check the harness performs, the fifteen keys were also read back
out of the *shipped* `Mod/1.6/Assemblies/SkillIcons.dll` as UTF-16 string literals: the binary
contains exactly those fifteen `SkillIcons.` keys and no sixteenth, so no key removed with the
skill and work type icons survives in the delivered assembly while being absent from the language
files. The DLL's timestamp (2026-09-19 11:50) is later than every `.cs` file's, so the shipped
binary is the current source. No C# was changed in this pass and nothing was rebuilt.

**The two patched Alpha Skills texts, re-verified rather than inherited.** The 2026-09-17 audit
concluded no French DefInjected is needed for `AS_NudistPassion_Active.description` and
`AS_PainDrivenPassion_Active.label` because Alpha Skills ships no French. That claim was checked
again directly against the installed packages rather than taken on trust:
`steamapps\workshop\content\294100\3448953006\Languages` contains `English\Keyed` and nothing
else, and `...\3400246558\Languages` (Vanilla Skills Expanded) likewise contains only
`English\Keyed`. Neither mod ships a `French` folder, and neither ships DefInjected in any
language, so both mods' passion labels and descriptions come straight from their Def source and
display in English whatever the interface language. Replacing that English text with better
English therefore regresses nothing in French and creates no French coverage gap. Both target
defs were confirmed still present in the installed Alpha Skills 1.6 defs
(`Defs\PassionDefs\Passions.xml` and `Mods\Ideology\Defs\PassionDefs\Passions_Ideology.xml`). The
patch on Vanilla Skills Expanded adds only a `workBoxIconPath`, no text, so it carries no
translation duty at all. Only those two Workshop ids were opened; the rest of the Workshop folder
was not scanned.

**Commands run, and their results.**

- `powershell -ExecutionPolicy Bypass -File scripts\Check-DefInjected.ps1 -TransMod
  C:\Users\nelim\Documents\rimworld\SkillIcons\Mod -Targets
  C:\Users\nelim\Documents\rimworld\SkillIcons\Mod` (absolute paths both sides): 31 patch
  operations applied, 11,587 defs indexed, 2 keys checked, 0 errors. The two keys are
  `SkillIcons_Settings.label` and `SkillIcons_Settings.description`, the only DefInjected this mod
  ships. No target went unresolved. Alpha Skills and Vanilla Skills Expanded were not supplied as
  targets because this mod ships no DefInjected aimed at them, by the reasoning above; had it
  done so, they would have had to be named or every key would have read as uncovered.
- `powershell -ExecutionPolicy Bypass -File _tools\Run-Tests.ps1`: **25 tests, 0 skipped, all
  passing**, unchanged from the 2026-09-19 figure. Its section E is what covers translation: EN/FR
  key-set parity with non-empty values, every `.Translate()` call site having a matching Keyed
  entry, and `SkillIcons_Settings.label`/`.description` resolving English from the Def and French
  from DefInjected.
- A one-off comparison over the two Keyed files and the French DefInjected file, run in
  PowerShell with `System.Xml`: XML validity, per-file duplicate element names, empty values,
  key-set difference in both directions, `{0}`-style placeholder sets, `\n` counts, EN-equals-FR
  detection and untranslated-marker detection. Fifteen entries each side, no duplicate, no empty,
  no difference in either direction, and not one flagged string.
- `[IO.File]::ReadAllBytes` over the shipped DLL with a `SkillIcons\.[A-Za-z]+` match on its
  UTF-16 literals: sixteen distinct hits, the fifteen keys plus the `SkillIcons.dll` filename the
  build-date diagnostic composes.

**What the harness still cannot see.** Section E compares key sets and call sites, which catches
an orphan on either side, but it cannot tell a French entry that is genuinely translated from one
that is the English string copied over, cannot compare `{0}` placeholders or `\n` counts between
the two languages, and cannot read the delivered DLL's own key literals. Those four checks were
done by hand this pass, as described above, and all four passed; a future session repeating this
gate should redo them rather than read a green harness as covering them. Adding them to section E
would be reasonable and was not done here.

**What only a running game can settle, and stays `unverified`.** Per TRANSLATIONS.md §3 these do
not block `preTest` and are tracked separately: `docs/TESTING.md` Scenario 10, opening the
settings page with the game language set to French and then to English and reading every label,
tooltip, radio option, slider label and the gallery hint on screen for raw keys, fallback text,
mis-substituted parameters and clipping, plus the same check on the `SkillIcons_Settings`
MainButtons shortcut's own label once a customization mod reveals it. That is already carried in
`remaining` and is not duplicated there. Note also that the French text is consistently the
longer of the two, which the gallery hint's measured-height code was written for; only the game
can confirm it wraps rather than clips.

**Why the three front-matter fields stay `partial`.** Unchanged and untouched by this pass. Every
static check TRANSLATIONS.md §1-§3 asks for now passes, but the document gates finalizing them on
`settings_audit` being `complete` or justified `not_applicable`, and it is `partial` because
MOD_SETTINGS.md §4's in-game checklist has never been run. `localization`, `translation_en` and
`translation_fr` can be flipped to `complete` on the evidence above the moment that gate clears,
provided nothing player-facing has changed in between.

## Automation of the remaining scenarios — 2026-09-20

Written to shorten her side of the verification, not to replace it. Scenarios 5, 8, 9, 10 and 11
now have feature files, so what is left to do by hand is one run and seven screenshots, listed at
the top of `Tests/Pickle/README.md`.

`06-def-fixes.feature` is the one worth singling out, because it needed no custom step and no
screenshot at all. The five def fixes are changes to def *fields*, so Pickle's own generic
vocabulary can read the loaded `DefDatabase` directly - `def "X" field "y" is "z"` - which is
stronger evidence than the tooltip screenshot Scenario 11 originally asked for: a screenshot shows
one state of one pawn, these read the values every tooltip is built from. Each one is paired with
`was patched by mod "SkillIcons"`, which closes the gap `<success>Always</success>` would
otherwise hide: without it a fix could read correct because Alpha Skills repaired it upstream
while this mod's patch had silently stopped matching.

The other four needed a new `VerificationSteps.cs`. What each one can and cannot settle is stated
in its own header rather than implied:

- **07**, Scenario 5: two screenshots of one pawn, the option off then on, with a Major passion on
  the row below so the "not more prominent than a real passion" judgement has something to compare
  against in the same frame.
- **08**, Scenario 8: the object → file → object round trip, asserted by name against the file on
  disk and then read back through the game's own `ReadModSettings`. It does not restart RimWorld,
  which one process cannot; WorkStudio's suite met the same wall and answered it the same way.
- **09**, Scenario 9: the def is hidden on a clean configuration, and activating its worker opens
  `Dialog_ModSettings` **for this mod** - the dialog's own `Mod` field is read back, because a
  settings window opened for some other mod would look identical in a screenshot. Driving RIMMSQOL
  itself stays manual.
- **10**, Scenario 10: `LanguageDatabase.SelectLanguage` switches the live language, which
  re-resolves Keyed text immediately - and the settings page is entirely Keyed, so the screenshot
  really is the French page. DefInjected does not re-resolve without a def reload, so the
  MainButtonDef's own label stays manual. The scenario restores English before it ends, because
  Pickle runs every scenario in one session and leaving it French would fail something later for
  no apparent reason.

None of these has been run. `dotnet build` proves the C# and the Cucumber expressions are well
formed against the real assemblies; it proves nothing about behaviour. Two guesses in particular
will be settled or refuted by the first run: that Pickle matches `of type "PassionDef"` on the
short name of `VSE.Passions.PassionDef`, and that `was patched by mod` expects the display name
`SkillIcons`. Both fail loudly rather than silently if wrong.

## Third in-game run — 2026-09-20

Ten SkillIcons scenarios, eight passed, two failed. **Both failures were bugs in the tests, not in
the mod**, and both are worth recording because each was a wrong assumption rather than a typo.

**Scenario 3 is confirmed fixed, which was the point of the run.** Detail under that scenario in
`docs/TESTING.md`: the three modes now measure 5027 / 4532 / 4735 red pixels against a flat
5045 / 5027 / 5060 before, and at 6x every heart is red in colour, every heart is grey in greyed,
and in mixed the live passion is red while the dormant ones are grey. The last of those is the
behaviour the mode exists for and the numbers alone could not have shown it.

**Scenario 11 passed on generic vocabulary alone.** Both guesses recorded on 2026-09-20 turned out
right: Pickle matches `of type "PassionDef"` on the short name of `VSE.Passions.PassionDef`, and
`was patched by mod` wants the display name `SkillIcons`. All five fixes assert both their value
and their patcher against the loaded `DefDatabase`.

**Scenario 8 failed on a genuine trap in this mod's own shape.** The settings file it read held
only `<showNonePassion>True</showNonePassion>` - a value from the *previous* scenario - and none
of the three the scenario had just set. The cause is that `SkillIconsMod.Settings`, the static the
drawing code reads, and `Mod.modSettings`, the field `WriteSettings()` serialises, are two
references to what is normally one object. `SettingsSandbox.ResetToDefaults` repointed only the
static, so every step wrote to the object being drawn while `WriteSettings()` kept saving the
stale one. Nothing on screen could ever have revealed this; only asking the file could. Fixed by
repointing both, in the sandbox and in the re-read step.

**Scenario 10 failed on RimWorld's own naming.** `LanguageDatabase.AllLoadedLanguages` carries
folder names like `French (Français)` and `Spanish (Español(Castellano))`, so an exact match on
`"French"` finds nothing. The step now tries exact first, then a `"<name> ("` prefix, in that order
so that `Russian` cannot accidentally take `Russian (Русский)` - both exist in that list.

Neither fix has been re-run.

**One caveat on Scenario 10 that the fix does not address.** Her mod list has `aitranslation.pack`
and `seohyeon.autotranslation` active, and the log shows the second announcing a
`Dynamic UI interceptor`. If it supplies text for our keys, the French screenshot would show its
machine translation rather than `Languages/French/Keyed/SkillIcons.xml`, and the
`does not read as a raw key` assertions would pass even against a broken French file - a vacuous
test that says nothing while looking green. Scenario 10 should be re-run with those two disabled
before any French evidence from it is believed.

## Publication art — 2026-09-20

Gathered for the Workshop upload. One thing had to be fixed rather than gathered.

**`Mod/About/Preview.png` was advertising content the mod no longer ships.** It was generated on
2026-09-04 and carried a monochrome bottom row of twelve skill and twenty-three work type icons,
captioned as such, under a subtitle reading "One icon set for passions, skills and work types."
All of that left for Work Studio on 2026-09-19. `_tools/preview.js` was also broken rather than
merely stale: it read `_tools/svg/Skills` and `_tools/svg/WorkTypes`, directories deleted with the
feature, so the next run of `build.sh` would have thrown rather than quietly producing a wrong
board.

Fixed by removing the row and both claims, and spending its height on the passion grid instead of
leaving it empty: the twenty-four hue-sorted passions now render at 72px over three rows of eight,
where they were 44px over two rows of twelve. The hue sequence is untouched, so the sweep across
the wheel still reads in order. Regenerated: 896x504, 63 KB, well inside Steam's 1 MB limit.
`Art/Preview-source.png`, the bare version the repository's overlay process engraves, was
regenerated from the same pass.

`Mod/About/ModIcon.png` needed nothing: 128x128, the mascot, unrelated to the departed set.

**`Screenshots/` was regenerated wholesale** from the 2026-09-20 run, because two images of the
previous set had stopped being true - the settings page still showed the removed section, and the
work tab mode trio was three identical pictures, that being the defect the same run exposed. The
new set is six images, listed with their sources in `Screenshots/README.md`. The strongest is
`02-work-tab-modes.png`, the three modes labelled and stacked, which is now a real demonstration
rather than three copies of one picture.

One gap worth naming rather than leaving implicit: **nothing in the set shows an animation
moving**, which is the mod's most distinctive feature and the one a still image cannot carry. The
raw material for a short GIF already exists in `PickleReports`, which holds consecutive frames of
animated passions.

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
