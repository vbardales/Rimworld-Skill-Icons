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
    // Deliberately false: vanilla draws nothing at all for "no passion", and
    // that empty space is what lets you spot the skills that matter at a glance.
    public bool showNonePassion = false;
    // The Work tab is the screen where players spend the most time, and VSE
    // draws passions there small and grey.
    //
    // The MIXED mode is the most interesting of the three: it reuses the
    // meaning the icon set already carries - steel means "the bonus is
    // asleep". The grid therefore doesn't just become more readable, it says
    // which bonuses are actually running.
    //
    // Size and opacity are two separate settings because the priority digit
    // lives in the same cell: enlarging helps you see the passion, but it is
    // opacity that gives the digit back to the text.
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

    private const float RowHeight = 34f;
    private const float IconSize = 26f;
    private const float ColumnWidth = 260f;

    private Vector2 scroll;
    private List<PassionDef> cached;

    public SkillIconsMod(ModContentPack content) : base(content)
    {
        Settings = GetSettings<SkillIconsSettings>();

        // RimWorld only loads assemblies at startup: a DLL recompiled while a
        // game is running is not the one actually running. Without this line
        // there is no way to tell "the fix does not work" apart from "the fix
        // is not loaded" - the log now gives the date of the build actually
        // in memory.
        try
        {
            var dll = System.IO.Path.Combine(content.RootDir, "1.6", "Assemblies", "SkillIcons.dll");
            if (System.IO.File.Exists(dll))
                Log.Message("[SkillIcons] assembly dated "
                    + System.IO.File.GetLastWriteTime(dll).ToString("yyyy-MM-dd HH:mm:ss"));
        }
        catch { /* a diagnostic footprint must never prevent loading */ }
    }

    public override string SettingsCategory() => "Skill Icons";

    public override void DoSettingsWindowContents(Rect inRect)
    {
        // The controls take exactly the room they need and the gallery gets
        // the rest. This used to be a hardcoded 500px, which drifted every
        // time a control was added or removed - the gallery lost space that
        // nothing was drawing in, and it is the gallery that the player is
        // here to look at.
        var listing = new Listing_Standard();
        listing.Begin(new Rect(inRect.x, inRect.y, inRect.width, inRect.height));
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

        var controlsHeight = listing.CurHeight;
        listing.End();

        // Measured, not assumed: the hint is two sentences and wraps to two
        // lines at most window widths - more often in French, which is the
        // longer string. A fixed one-line rect clipped it.
        Text.Font = GameFont.Small;
        var hint = "SkillIcons.GalleryHint".Translate();
        var hintHeight = Text.CalcHeight(hint, inRect.width);
        var galleryLabel = new Rect(inRect.x, inRect.y + controlsHeight + 10f,
                                    inRect.width, hintHeight);
        GUI.color = new Color(1f, 1f, 1f, 0.6f);
        Widgets.Label(galleryLabel, hint);
        GUI.color = Color.white;

        var top = galleryLabel.yMax + 4f;
        DrawGallery(new Rect(inRect.x, top, inRect.width, inRect.yMax - top));
    }

    private void DrawGallery(Rect rect)
    {
        // Every declared passion, whatever mod brings it in: vanilla, VSE,
        // Alpha Skills, or anything else installed alongside.
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
        // The right-hand column shows what the Work tab will actually draw,
        // mode and animation included. The "no workBoxIconPath" case is
        // handled inside WorkBoxAnimatedIcon, which returns null: there is
        // nothing to keep here.
        Draw(grey, PassionIconAnimations.WorkBoxAnimatedIcon(def));

        var label = new Rect(grey.xMax + 8f, cell.y, cell.width - (grey.xMax - cell.x) - 8f,
                             cell.height);
        Text.Font = GameFont.Tiny;
        Text.Anchor = TextAnchor.MiddleLeft;
        Widgets.Label(label, def.LabelCap);
        Text.Anchor = TextAnchor.UpperLeft;
        Text.Font = GameFont.Small;

        // VSE's full description states the learning speed: that is exactly
        // what the icon's saturation is meant to convey.
        TooltipHandler.TipRegion(cell, () => def.FullDescription, def.shortHash);
        Widgets.DrawHighlightIfMouseover(cell);
    }

    private static void Draw(Rect rect, Texture2D texture)
    {
        if (texture == null) return;
        GUI.DrawTexture(rect, texture);
    }
}
