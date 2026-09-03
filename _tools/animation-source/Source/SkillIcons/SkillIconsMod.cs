using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Verse;
using VSE.Passions;

namespace SkillIcons;

public sealed class SkillIconsSettings : ModSettings
{
    public bool enabled = true;
    public float speed = 1f;
    // Volontairement à false : vanilla ne dessine rien pour "no passion", et
    // ce vide sert à repérer d'un coup d'œil les compétences qui comptent.
    public bool showNonePassion = false;
    // L'onglet Travail est l'écran où l'on passe le plus de temps, et VSE y
    // affiche les passions petites et grises.
    //
    // Le mode MIXTE est le plus intéressant des trois : il réemploie le sens
    // déjà porté par le jeu d'icônes — l'acier veut dire « le bonus dort ». La
    // grille ne devient donc pas seulement plus lisible, elle dit quels bonus
    // sont en train de tourner.
    //
    // Taille et opacité sont deux réglages distincts parce que le chiffre de
    // priorité vit dans la même case : agrandir aide à voir la passion, mais
    // c'est l'opacité qui rend le chiffre au texte.
    public const int ModeCouleur = 0, ModeGris = 1, ModeMixte = 2;
    public int workTabMode = ModeMixte;
    public float workTabScale = 1.3f;
    public float workTabOpacity = 0.85f;

    public override void ExposeData()
    {
        Scribe_Values.Look(ref enabled, "enabled", true);
        Scribe_Values.Look(ref speed, "speed", 1f);
        Scribe_Values.Look(ref showNonePassion, "showNonePassion", false);
        Scribe_Values.Look(ref workTabMode, "workTabMode", ModeMixte);
        Scribe_Values.Look(ref workTabScale, "workTabScale", 1.3f);
        Scribe_Values.Look(ref workTabOpacity, "workTabOpacity", 0.85f);
        speed = Mathf.Clamp(speed, 0.5f, 1.5f);
        workTabScale = Mathf.Clamp(workTabScale, 1f, 1.8f);
        workTabOpacity = Mathf.Clamp(workTabOpacity, 0.25f, 1f);
        workTabMode = Mathf.Clamp(workTabMode, ModeCouleur, ModeMixte);
    }
}

public sealed class SkillIconsMod : Mod
{
    internal static SkillIconsSettings Settings;

    private const float HeaderHeight = 340f;
    private const float RowHeight = 34f;
    private const float IconSize = 26f;
    private const float ColumnWidth = 260f;

    private Vector2 scroll;
    private List<PassionDef> cached;

    public SkillIconsMod(ModContentPack content) : base(content)
    {
        Settings = GetSettings<SkillIconsSettings>();

        // RimWorld ne charge ses assemblages qu'au démarrage : une DLL
        // recompilée pendant qu'une partie tourne n'est pas celle qui tourne.
        // Sans cette ligne, on ne peut pas distinguer « le correctif ne marche
        // pas » de « le correctif n'est pas chargé » — le journal donne
        // maintenant la date de la version réellement en mémoire.
        try
        {
            var dll = System.IO.Path.Combine(content.RootDir, "1.6", "Assemblies", "SkillIcons.dll");
            if (System.IO.File.Exists(dll))
                Log.Message("[SkillIcons] assemblage du "
                    + System.IO.File.GetLastWriteTime(dll).ToString("yyyy-MM-dd HH:mm:ss"));
        }
        catch { /* une empreinte de diagnostic ne doit jamais empêcher le chargement */ }
    }

    public override string SettingsCategory() => "SkillIcons";

    public override void DoSettingsWindowContents(Rect inRect)
    {
        var header = new Rect(inRect.x, inRect.y, inRect.width, HeaderHeight);
        var listing = new Listing_Standard();
        listing.Begin(header);
        listing.CheckboxLabeled("SkillIcons.Animated".Translate(), ref Settings.enabled,
            "SkillIcons.AnimatedDesc".Translate());
        listing.Gap(4f);
        listing.Label("SkillIcons.Speed".Translate(Settings.speed.ToString("0.0")));
        Settings.speed = listing.Slider(Settings.speed, 0.5f, 1.5f);
        listing.Gap(4f);
        listing.CheckboxLabeled("SkillIcons.ShowNone".Translate(), ref Settings.showNonePassion,
            "SkillIcons.ShowNoneDesc".Translate());
        listing.GapLine(10f);
        listing.Label("SkillIcons.WorkTab".Translate());
        if (listing.RadioButton("SkillIcons.WorkTabColour".Translate(),
                Settings.workTabMode == SkillIconsSettings.ModeCouleur, 8f,
                "SkillIcons.WorkTabColourDesc".Translate()))
            Settings.workTabMode = SkillIconsSettings.ModeCouleur;
        if (listing.RadioButton("SkillIcons.WorkTabGrey".Translate(),
                Settings.workTabMode == SkillIconsSettings.ModeGris, 8f,
                "SkillIcons.WorkTabGreyDesc".Translate()))
            Settings.workTabMode = SkillIconsSettings.ModeGris;
        if (listing.RadioButton("SkillIcons.WorkTabMixed".Translate(),
                Settings.workTabMode == SkillIconsSettings.ModeMixte, 8f,
                "SkillIcons.WorkTabMixedDesc".Translate()))
            Settings.workTabMode = SkillIconsSettings.ModeMixte;
        listing.Gap(4f);
        listing.Label("SkillIcons.WorkTabScale".Translate(
            Mathf.RoundToInt(Settings.workTabScale * 100f)));
        Settings.workTabScale = listing.Slider(Settings.workTabScale, 1f, 1.8f);
        listing.Label("SkillIcons.WorkTabOpacity".Translate(
            Mathf.RoundToInt(Settings.workTabOpacity * 100f)));
        Settings.workTabOpacity = listing.Slider(Settings.workTabOpacity, 0.25f, 1f);
        listing.End();

        var galleryLabel = new Rect(inRect.x, inRect.y + HeaderHeight, inRect.width, 24f);
        Text.Font = GameFont.Small;
        GUI.color = new Color(1f, 1f, 1f, 0.6f);
        Widgets.Label(galleryLabel, "SkillIcons.GalleryHint".Translate());
        GUI.color = Color.white;

        var top = galleryLabel.yMax + 4f;
        DrawGallery(new Rect(inRect.x, top, inRect.width, inRect.yMax - top));
    }

    private void DrawGallery(Rect rect)
    {
        // Toutes les passions déclarées, quel que soit le mod qui les apporte :
        // vanilla, VSE, Alpha Skills, ou autre chose installé à côté.
        cached ??= DefDatabase<PassionDef>.AllDefsListForReading
            .Where(d => !d.iconPath.NullOrEmpty())
            .OrderBy(d => d.defName)
            .ToList();

        var columns = Mathf.Max(1, Mathf.FloorToInt(rect.width / ColumnWidth));
        var rows = Mathf.CeilToInt(cached.Count / (float)columns);
        var view = new Rect(0f, 0f, rect.width - 20f, rows * RowHeight);

        Widgets.BeginScrollView(rect, ref scroll, view);
        var cellWidth = view.width / columns;
        for (var i = 0; i < cached.Count; i++)
        {
            var def = cached[i];
            var cell = new Rect((i % columns) * cellWidth,
                                Mathf.Floor(i / (float)columns) * RowHeight,
                                cellWidth, RowHeight);
            if (i % 2 == 0) Widgets.DrawLightHighlight(cell);
            DrawEntry(cell.ContractedBy(3f), def);
        }
        Widgets.EndScrollView();
    }

    private static void DrawEntry(Rect cell, PassionDef def)
    {
        var y = cell.y + (cell.height - IconSize) / 2f;
        var colour = new Rect(cell.x, y, IconSize, IconSize);
        var grey = new Rect(colour.xMax + 4f, y, IconSize, IconSize);

        Draw(colour, PassionIconAnimations.SkillUiAnimatedIcon(def));
        // La colonne de droite montre ce que l'onglet Travail dessinera vraiment,
        // mode et animation compris. Le cas « pas de workBoxIconPath » est traité
        // dans WorkBoxAnimatedIcon, qui rend null : il n'y a rien à garder ici.
        Draw(grey, PassionIconAnimations.WorkBoxAnimatedIcon(def));

        var label = new Rect(grey.xMax + 8f, cell.y, cell.width - (grey.xMax - cell.x) - 8f,
                             cell.height);
        Text.Font = GameFont.Tiny;
        Text.Anchor = TextAnchor.MiddleLeft;
        Widgets.Label(label, def.LabelCap);
        Text.Anchor = TextAnchor.UpperLeft;
        Text.Font = GameFont.Small;

        // La description complète de VSE dit la vitesse d'apprentissage : c'est
        // exactement ce que la saturation de l'icône est censée traduire.
        TooltipHandler.TipRegion(cell, () => def.FullDescription, def.shortHash);
        Widgets.DrawHighlightIfMouseover(cell);
    }

    private static void Draw(Rect rect, Texture2D texture)
    {
        if (texture == null) return;
        GUI.DrawTexture(rect, texture);
    }
}
