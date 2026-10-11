# Texts already sent, folded out of PUBLICATION.md 2026-10-11 (14.c)

Verbatim. The three Workshop comments are the texts WORKSHOP_COMMENTS.md records as posted 2026-09-21 (retained); the change notes were sent by the CI (1.0.3 on 2026-10-11, run 38092317984).

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

## Steam change notes sent

### 1.0.3 — ready to post with the next Workshop update (CI dry-run 2026-10-09)

```
[h3]1.0.3 — Skill Icons[/h3]

[list]
[*]Improved French and English wording in the settings descriptions, including gender-neutral French for the 'no passion' option.
[*]Alpha Skills is now optional: nothing in the mod needs it, so you are no longer forced to download it. With it installed nothing changes.
[*]New mod icon and Preview, and a retaken gallery.
[/list]

The package ID and saved settings are unchanged.
```

### 1.0.2 — posted 2026-09-24 by the CI (v1.0.2, run 35963526970)

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
