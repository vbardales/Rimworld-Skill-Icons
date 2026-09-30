# Traductions en jeu

Langue d'origine des chaînes : anglais (aucune autre langue source). Table complète des chaînes
traduites, par fichier.

## `Languages/English|French/Keyed/SkillIcons.xml`

| Clé | Anglais | Français |
|---|---|---|
| `SkillIcons.Animated` | Animated passion icons | Icônes de passion animées |
| `SkillIcons.AnimatedDesc` | On: supported passions animate in the pawn creation screen, the Bio skill list and the Work tab.\nOff: the whole set stays fully static, including in the gallery below. | Activé : les passions concernées s'animent sur l'écran de création des colons, dans la liste des compétences et dans l'onglet Travail.\nDésactivé : tout le jeu d'icônes reste fixe, y compris dans la galerie ci-dessous. |
| `SkillIcons.Speed` | Animation speed: {0}x | Vitesse d'animation : {0}× |
| `SkillIcons.ShowNone` | Show an icon for "no passion" | Afficher une icône pour « aucune passion » |
| `SkillIcons.ShowNoneDesc` | Vanilla draws nothing at all when a pawn has no passion for a skill. Turn this on to draw a faint hollow heart instead.\n\nOff by default: that empty space is what lets you spot the skills that matter at a glance. | Le jeu de base ne dessine rien du tout lorsqu'un.e colon n'a aucune passion pour une compétence. Activez cette option pour y mettre un contour de cœur estompé.\n\nDésactivée par défaut : c'est ce vide qui permet de repérer d'un coup d'œil les compétences qui comptent. |
| `SkillIcons.WorkTab` | Work tab | Onglet Travail |
| `SkillIcons.WorkTabColour` | Colour | En couleur |
| `SkillIcons.WorkTabColourDesc` | Always draw the full-colour icon, whatever the passion's state. | Toujours dessiner l'icône en couleur, quel que soit l'état de la passion. |
| `SkillIcons.WorkTabGrey` | Greyed | Grisée |
| `SkillIcons.WorkTabGreyDesc` | Always draw the two-grey work tab variant. This is how Vanilla Skills Expanded behaves. | Toujours dessiner la variante à deux nuances de gris. C'est le comportement de Vanilla Skills Expanded. |
| `SkillIcons.WorkTabMixed` | Mixed, by activation state | Mixte, selon l'état d'activation |
| `SkillIcons.WorkTabMixedDesc` | Colour when the learning bonus is live - either the passion is currently triggered, or its bonus is permanent. Grey when it is dormant.\n\nThis reuses what the icon set already means: steel says the bonus is asleep. The grid then tells you which bonuses are actually running. | En couleur quand le bonus d'apprentissage est actif, soit la passion est déclenchée, soit son bonus est permanent. En gris quand il dort.\n\nCe mode réemploie ce que le jeu d'icônes dit déjà : l'acier indique que le bonus est inactif. La grille vous indique alors quels bonus sont actifs. |
| `SkillIcons.WorkTabScale` | Icon size: {0}% | Taille des icônes : {0} % |
| `SkillIcons.WorkTabOpacity` | Icon opacity: {0}% | Opacité des icônes : {0} % |
| `SkillIcons.GalleryHint` | Every passion, twice: on the left as it appears in the skill list, on the right as it appears in the work tab. Animated ones play here at the speed set above. | Chaque passion, deux fois : à gauche telle qu'elle apparaît dans la liste des compétences, à droite telle qu'elle apparaît dans l'onglet Travail. Les animées s'animent ici à la vitesse réglée ci-dessus. |

15 clés, table complète (compte vérifié contre le fichier source).

## `Languages/French/DefInjected/MainButtonDef/MainButtons.xml`

Source anglaise : `Mod/1.6/Defs/MainButtonDefs/MainButtons.xml`, def `SkillIcons_Settings`. Pas de
fichier DefInjected anglais : le `<label>`/`<description>` du def lui-même sert de source anglaise.

| Field | Anglais | Français |
|---|---|---|
| `SkillIcons_Settings.label` | Skill Icons | Skill Icons |
| `SkillIcons_Settings.description` | Open the Skill Icons mod settings. | Ouvrir les réglages du mod Skill Icons. |

## Textes Alpha Skills patchés par ce mod (hors `Keyed`/`DefInjected` de ce mod)

`Mod/1.6/Patches/AlphaSkills_Fixes.xml` a patché deux champs de defs Alpha Skills (historique :
`AS_NudistPassion_Active.description`, `AS_PainDrivenPassion_Active.label`, retirés depuis que
Sarg Bjornson les a corrigés en amont, voir `CHANGELOG.md` [1.0.1]). Alpha Skills ne fournit aucun
dossier français : ces champs restent en anglais quelle que soit la langue d'interface, y compris
avant le retrait des patches. Mécanisme : `PatchOperationReplace` sur le def anglais d'Alpha
Skills ; ce mod n'a jamais possédé ni patché de `DefInjected` français pour ces champs, faute de
`Languages/French` dans Alpha Skills lui-même à corriger.

Statut : `defect`, non résolu par ce mod : dépendance externe sans version française. Non couvert
par une clé de ce mod (`remaining`, `STATUS.md`).

## Couverture

15 clés `Keyed`, identiques en anglais et français. 2 champs `DefInjected`, français seul présent
en fichier car source = def lui-même. 2 champs Alpha Skills historiquement patchés par ce mod :
`defect`, anglais uniquement (voir section ci-dessus).
