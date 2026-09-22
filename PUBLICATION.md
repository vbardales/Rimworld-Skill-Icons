# Publication

What the Workshop page needs and the rest of the repository does not hold. Written for the first
upload of 2026-09-21, and for whoever updates this mod next.

Workshop item: **3805383957**.

## Screenshots, in this order

Steam shows the first one large under the Preview, so the most demonstrative goes there rather
than the prettiest.

| Order | File | What it shows |
|---|---|---|
| 1 | `Screenshots/02-work-tab-modes.png` | The three work tab modes, stacked and labelled. The strongest single image: it shows what the mod does and why it has settings, at once. |
| 2 | `Screenshots/07-passions-animated.gif` | Sixteen passions animating, 6s, looping. The one thing a still cannot carry. |
| 3 | `Screenshots/01-settings-page.png` | The whole settings window on a clean configuration, live gallery at the bottom. |
| 4 | `Screenshots/06-worktab-icons-large.png` | Work tab cells at maximum size and opacity. |
| 5 | `Screenshots/05-worktab-icons-small.png` | The same at minimum — 4 and 5 are the before/after of the two sliders. |
| 6 | `Screenshots/03-no-passion-icon.png` | The "no passion" icon off then on, side by side. |
| 7 | `Screenshots/04-bio-tab-skills.png` | The skill list. The weakest: fixture colonists, low levels. Last, or not at all. |

`Screenshots/README.md` says how each one was cropped and from which capture.

The settings and Bio images were regenerated headlessly on 2026-09-22 against PickleTools' tested
zen studio fixture, then opened and reviewed individually. The first green attempt was rejected:
screenshot mode hid the Bio `InspectTab` while leaving only the pawn card. The corrected pass
(`0922-1623`) kept that interface where it is the subject and passed 2/2. Both selected crops are
under 2 MB and contain the intended window/tab over the zen background. Green proves the journey
ran; the recorded visual review is what makes these two images publishable.

## Dependencies and DLCs

**No DLC is required.** `supportedVersions` declares 1.6 only and `loadFolders.xml` has no
`IfModActive` branch.

| Declared | packageId | Actually required |
|---|---|---|
| Harmony | `brrainz.harmony` | Yes — the mod patches by transpiler |
| Vanilla Skills Expanded | `vanillaexpanded.skills` | Yes — the C# does `using VSE.Passions`; without `PassionDef` the assembly does not load |
| Alpha Skills | `sarg.alphaskills` | No, technically. No `.cs` file references it and the DLL carries no reference. Without it the mod draws the VSE passions and 26 of its 85 textures go unused. Declared hard because the set is designed for both. |

`loadAfter` also carries `oracle.skills.retexture`, for the texture-path collision, without making
it a dependency.

Worth knowing: Alpha Skills keeps some passions in `1.6/Mods/Ideology`, loaded only
`IfModActive="Ludeon.RimWorld.Ideology"`. Three of the five def fixes in
`1.6/Patches/AlphaSkills_Fixes.xml` target defs that live there. Without Ideology those three go
inert on their own and the other two still apply — which is the point of them being independent
operations rather than one sequence.

## Mature content checkboxes

**None of them.** The mod is a UI icon set: 85 hearts carrying a small mark, drawn at 64x64 and
shown at 24 px. No characters, no scenes.

Three icons have names that could raise the question from a file listing, and all three were
opened before answering: `AS_NudistPassion_Active` is a skin-toned heart with two little legs and
a green fig leaf, `AS_IntimatePassion_Active` is two overlapping pink hearts, `AS_DrunkenPassion`
is a goblet with a heart in it. Cartoon pictograms, emoji register.

The checkboxes cover this item, not its dependencies: Alpha Skills and VSE carry their own.

## Messages for the mods this one draws from

Steam comments take BBCode, and a bare Workshop URL becomes a widget — hence the link alone on the
last line. Under 1000 characters each.

**Post them once the item is public.** A link to a private item opens for nobody and the widget
does not render.

One register per recipient. The same text three times shows.

### Vanilla Skills Expanded — posted 2026-09-21

The workshop. Brush and palette: thanking the people who stretched the canvas.

```
Hello! 🎨 I just released a passion icon set built on top of VSE, and I wanted to come and say thank you properly.

PassionDef is the whole reason it exists — without it there are two passions to draw instead of eighty-five, and no iconPath to override. You handed me a canvas and I spent weeks filling it. 🖌️

One tiny thing, if it is useful to you: VSE_Apathy has no workBoxIconPath, so an apathetic skill's cell in the work tab stays empty while every other passion shows something. I patch it on my side with [code]<success>Always</success>[/code], so it quietly steps aside the day you add the field. No rush at all!

Thank you for the framework. 🙏

https://steamcommunity.com/sharedfiles/filedetails/?id=3805383957
```

### Alpha Skills — posted 2026-09-21

The bestiary. Playful, naming his strangest passions and borrowing their emoji. The only one of
the three that carries something useful to its recipient: the four def mistakes, named.

```
Hello! 👋 I just released a passion icon set, and honestly your twenty-six circumstantial passions are why it got so big — drunken, frozen, blind, pain-driven... an absolute joy to draw. 🍷❄️

While reading your defs closely (many, many times! 👀) I bumped into four little things you may want upstream. Each is patched on my side with [code]<success>Always</success>[/code], so it steps aside on its own the day you fix it:

[list]
[*]AS_NudistPassion_Active — its description is nomadic's, copy-pasted. It talks about caravans!
[*]AS_PainDrivenPassion_Active — keeps the dormant label, so both states look identical in the tooltip.
[*]AS_FrozenPassion — no workBoxIconPath, so its work tab cell falls back to something else.
[*]AS_BlindPassion_Sublime and _Elevated share one iconPath, though sublime gives 1x/2x and elevated 0.5x/1.5x.
[/list]

Thank you for the passions! 🎉

https://steamcommunity.com/sharedfiles/filedetails/?id=3805383957
```

**Reply, 2026-09-22 — posted.** Sarg answered within a day: "Thanks! Fixed them, except
the blind one, which is intentional." Three of the four are confirmed fixed on disk (the last two
matching this mod's own values exactly), and the three retired patches for them are in
`Mod/1.6/Patches/AlphaSkills_Fixes.xml`'s history. The reply below was posted on 2026-09-22.

```
That was fast! 🚀 Checked, and nudist/pain-driven/frozen are all fixed on my end too — the patches for those three are retired now, thank you.

And no worries at all about blind staying shared — makes sense as your own call. I'll keep my own separate icons for it on my side, just as this set's own visual language rather than a fix, since hue is identity for every passion I draw here.

Thanks for looking into it so quickly! 🙏
```

### Oracle's Skill Icon Retextures — posted 2026-09-21

The lineage. The ♥ belongs here and nowhere else: it is their motif, the one the whole set takes
up. Admiration first, the debt second, the technical part reduced to one passing sentence.

```
Hello! ♥ First of all: I am a fan. Your Skill Icon Retextures is what made me look at passion icons at all, and it is still the set I measure mine against. A heart carrying one small mark that says which passion it is — such a simple idea, and so exactly right. The little marks are lovely. 💗

So when I made a passion icon set of my own, released today, it follows your grammar from end to end. It would look nothing like it without yours to learn from, and I would rather you hear that from me than find it on your own.

Mine is drawn from scratch, so none of your files are in it, and I declare yours in loadAfter since we write to the same texture paths.

Thank you for the idea, and for the art. ♥

https://steamcommunity.com/sharedfiles/filedetails/?id=3805383957
```

## What the upload cannot take back

- The description is sent only when the item is created. Afterwards it is a manual edit on the
  Steam page. Read it one last time before clicking.
- `About/PublishedFileId.txt` is written into the mod folder by the upload and reaches the
  repository through the junction. Commit it at once: lost, the next upload creates a second item.
- Steam creates every item private and RimWorld never calls `SteamUGC.SetItemVisibility`. Going
  public is a manual step, after subscribing to the item and testing it for real.

## Steam change notes

Written at upload time, in the Change Notes tab, and easy to forget because nothing asks for them
until the form is already open. Unlike the description, these DO go out again on every update -
they are the one field of the page that can be corrected freely. BBCode works.

### 1.0.2 — ready to post with the next Workshop update

```
[h3]1.0.2 — Skill Icons[/h3]

[list]
[*]The mod's displayed name is now Skill Icons in the mod list, settings and optional shortcut.
[*]Updated the settings and Bio screenshots on a clean zen background.
[*]Refreshed the description, credits and attribution. Three Alpha Skills patches were retired after Sarg Bjornson fixed those defs upstream; the distinct blindness icons remain this mod's own artistic choice.
[*]Verified the RIMMSQOL shortcut, settings persistence across a real restart, and compatibility with Better, Compact, Enhanced and Krypt Work Tab.
[/list]

The package ID and saved settings are unchanged.
```

### 1.0.0 - 2026-09-21

```
[h3]1.0.0 — first release[/h3]

A unified passion icon set for Vanilla Skills Expanded and Alpha Skills. 85 textures, drawn from scratch, 40 of them animated.

[b]Added[/b]
[list]
[*]One hue per passion, spread across the colour wheel, carried by the main shape rather than a small accessory — at 24 px an accessory disappears. Every icon still reads as a plain black silhouette.
[*]40 animations, 920 frames. The padlock opens, the pendulum swings, the signal runs the circuit, the sand drains and stays drained.
[*]Work tab controls: passion icons in colour, greyed, or — the default — colour while the bonus is running and grey while it sleeps. Separate size and opacity sliders.
[*]An optional faint icon for "no passion", off by default.
[*]A gallery in the mod settings listing every passion twice, animating live.
[*]A hidden MainButtons shortcut for RIMMSQOL and friends, invisible on a clean install.
[*]English and French.
[/list]

[b]Fixed in other mods' defs[/b]
[list]
[*]Alpha Skills: "nudist (active)" carried "nomadic"'s description; "pain-driven (active)" kept its dormant label; "frozen" had no work tab icon; the two blindness tiers shared one icon despite granting different bonuses.
[*]Vanilla Skills Expanded: "apathy" had no work tab icon.
[/list]
Each fix goes quietly inert if it is repaired upstream.
```
