# Protocols read

Which shared documents a session read for this mod, at which revision of the monorepo, and which
were not useful, so a later session re-reads only what moved. Monorepo `HEAD` when written:
`53553c86` (2026-10-08). "Last commit" is the last commit that touched the file.

| Document | Last commit | Read 2026-10-08 | Useful here |
|---|---|---|---|
| `AGENTS.md` | 90d51374 (2026-09-25) | in full | yes: gates, evidence rules, CI publication |
| `AUDIT.md` | 90d51374 (2026-09-25) | in full | yes: transitions, stage codes, Pickle and evidence rules |
| `MOD_SETTINGS.md` | 90d51374 (2026-09-25) | in full | yes, nothing new: `settings_audit: complete` stands |
| `TRANSLATIONS.md` | 90d51374 (2026-09-25); French-agreement section dated 2026-10-08 | section 4 and the headings | yes: no plural key in `Keyed/` (only `{0}x` and `{0}%`), `translation_fr` stays `unchecked` for the gender-agreement session |
| `PUBLISHING.md` | 2ed02f0f (2026-10-06) | headings, "Départ depuis le projet d'origine", "Sources hors du dossier publié", "Dépôt" | yes: upstream-PR rule, `Mod/` as the only published folder |
| `STYLE_RIMWORLD.md` | c576e43a (2026-10-05) | not read | icon already checked at the `tested` gate; re-read only if the ModIcon or Preview is questioned |
| `WORKSHOP_COMMENTS.md` | 53553c86 (2026-10-08) | not read | not useful: the three comments are posted |
| `scripts/SEARCHING.md` | 90d51374 | not read | not useful for an audit |
| `PickleTools/README.md`, `Headless/README.md`, `docs/steps.md` | no history | not read | not useful: no run was requested; the suite is unchanged since `44fde64` |
| `Rimworld-Release-Admin/docs/OPERATIONS.md` | no history | not read | read before touching a workflow, tag or secret (none touched) |
| `Rimworld-Ticket-Dispatcher/docs/WELCOME.md`, `SUBMIT.md` | no history | not read | read before submitting a Pickle run |

Local files read: `STATUS.md` (front matter, first 200 lines), `CHANGELOG.md`, `ATTRIBUTION.md`,
`BACKLOG.md`, `docs/TESTING.md` (status, proofs), `docs/runs/`, `Mod/About/About.xml`,
`.gitignore`. `README.md`, `LICENSE`, `PUBLICATION.md`, `Tests/Pickle/` features (grepped for
`@wip` and `@requires` only) were not re-read. `NOTES.md` and `BUGS.md` do not exist.
