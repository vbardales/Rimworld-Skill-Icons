# Backlog

Ideas for mod not started. Each entry say what feature would be, what already cover part of it, what must be settled before first line of code.

Idea earn place here if **serve what mod already do**: SkillIcons draw passion icons, so anything making passion easier to recognise, choose or read belong here. Anything already shipped in changelog instead, anything needing check in play in `docs/TESTING.md`.

---

## Change a passion's icon by clicking it in the options

Proposed 2026-09-19.

**What feature would be.** Settings gallery already list every installed passion, twice each, animating live. Today only display. Click entry let player choose different drawing for that passion — swap icon without touching def, so survive update of Vanilla Skills Expanded or Alpha Skills.

**What already exists.** Gallery itself (`DrawGallery` in `SkillIconsMod.cs`), enumerate `DefDatabase<PassionDef>`, already resolve both variants per passion. Generator write 41 parametric drawings to `scripts/svg/Passions/`, so pool player could choose from already larger than any one passion set use: VSE install show subset, Alpha Skills install different one, but every drawing ship.

**What must be settled first.**

- **Where choice live.** `Dictionary<string, string>` of defName to drawing name in `SkillIconsSettings`, scribed like rest. Need rule for when stored drawing name no longer exist, and for passion def since removed — neither should throw, both fall back silently, like animation lookup already fall back to static icon.
- **How choice made.** Second window listing available drawings obvious form, but whole pool at 24 px is wall of similar hearts. 20 px silhouette rule apply here too: whatever picker draw, player must tell two entries apart at size they will actually see them.
- **Whether it replace hue.** Hue is identity in this set — design rule README open with — so letting player give two passions same drawing break the one invariant whole icon set built on. Either picker refuse drawing already taken, or rule knowingly relaxed for anyone opening this window. Design decision, not implementation one.
- **Work tab variant.** Every passion have two icons, not one: skill-list icon and greyed work tab variant. Picker changing only first leave work tab disagreeing with bio tab. Drawings generated in both forms, so pairing exist — just must be carried through choice.


---

## Propose the missing `workBoxIconPath` to Vanilla Skills Expanded upstream

Added 2026-10-08. Upstream repository: <https://github.com/Vanilla-Expanded/VanillaSkillsExpanded> (`vanillaexpanded.skills`, same `packageId` as Workshop item; no licence file in repository).

`1.6/Patches/VSE_Fixes.xml` add `workBoxIconPath` to `VSE_Apathy`, which has none. Fix in def better than patch here forever, and it is the one change this mod make to someone else's data. Open pull request there, then drop patch once merged and released. Public action: only with Virginie's agreement. Alpha Skills have no repository to send anything to; Sarg Bjornson take reports as Workshop comments (see `ATTRIBUTION.md`).