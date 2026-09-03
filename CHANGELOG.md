# Changelog

Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This file serves the repository and the writing of Steam patch notes; RimWorld does not display it in game.

## [1.0.0] — unreleased

First release.

### Added

- A unified passion icon set for Vanilla Skills Expanded and Alpha Skills: 85 textures, drawn from scratch by `_tools/gen.js`. Every passion owns a hue of its own, spread across the colour wheel, and that hue is carried by the main shape rather than by an accessory — at 24 px an accessory disappears.
- Animations for 40 passions, 920 frames. Each one is a gesture that says something about the passion rather than a generic wobble: the padlock opens, the pendulum swings, the signal runs the circuit, the sand drains.
- Work tab controls. Vanilla Skills Expanded draws work tab passions small and desaturated, which is where the grid becomes unreadable. Three modes — colour, greyed, or (the default) colour while the bonus is running and grey while it sleeps — plus separate size and opacity sliders, because size helps you see the passion while opacity gives the priority digit back to the text.
- Icons for the 12 skills and the 23 work types, monochrome by design: in this mod colour already means "which passion", and making it mean "which skill" as well would render both unreadable. Shape alone carries the identity.
- When *Pawn Badge - (MISC) Job Icons+ Revitalized* is installed, its icons are served instead, so a player already using those badges sees one consistent interface. Its textures are read at runtime, never copied.
- An optional faint icon for "no passion", off by default. Ten skills out of twelve carry it, and that empty space is what lets you spot the passionate ones at a glance.
- A gallery in the mod settings listing every passion with both its skill-list icon and its work-tab icon, animating live.
- English and French. Every string shown in the settings goes through `.Translate()`.

### Fixed

- Alpha Skills: `AS_NudistPassion_Active` carried a description copy-pasted from "nomadic"; `AS_PainDrivenPassion_Active` kept its dormant label, making the two states indistinguishable in the tooltip; `AS_FrozenPassion` had no `workBoxIconPath`; and both blindness tiers shared one icon despite granting different bonuses (0.5×/1.5× against 1×/2×).
- Vanilla Skills Expanded: `VSE_Apathy` had no `workBoxIconPath`.

Both patch files run inside a `<success>Always</success>` sequence, so if these defs are repaired upstream the patches go quietly inert instead of logging errors.
