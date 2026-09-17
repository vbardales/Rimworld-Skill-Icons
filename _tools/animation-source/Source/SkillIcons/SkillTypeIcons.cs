using System.Collections.Generic;
using HarmonyLib;
using RimWorld;
using UnityEngine;
using Verse;

namespace SkillIcons;

/// <summary>
/// Skill and work type icons - a set distinct from the passions', and obeying
/// the opposite rule: colour belongs to the passion, shape to the skill. Our
/// own drawings are therefore monochrome.
///
/// Two possible sources. If the player has "Pawn Badge - (MISC) Job Icons+
/// Revitalized", ITS icons are served: their interface then speaks with one
/// voice. Otherwise, ours. Nothing of theirs is copied into this mod - their
/// textures are read at runtime, which avoids any redistribution.
/// </summary>
[StaticConstructorOnStartup]
public static class SkillTypeIcons
{
    // The mapping was built by LOOKING at the icons, not by reading their
    // file names, under a strict rule: map when the icon means the same
    // thing, never when it merely resembles it. "drugs" is a capsule that
    // would suit Patient perfectly, but it means "addict" in the source
    // pack: serving it in the Patient column would plant in the player's
    // own interface exactly the confusion this mod exists to spare them.
    // Patient therefore keeps our drawing.
    private static readonly Dictionary<string, string> BadgeParCompetence = new()
    {
        ["Shooting"] = "shooter-modern",   ["Melee"] = "melee",
        ["Construction"] = "construction",  ["Mining"] = "mining",
        ["Cooking"] = "cooking",            ["Plants"] = "planter",
        ["Animals"] = "handle2",            ["Crafting"] = "repairs",
        ["Artistic"] = "artist",            ["Medicine"] = "doctor",
        ["Social"] = "dealmaker",           ["Intellectual"] = "research",
    };

    // Four work types have NO equivalent in the package and keep our own
    // drawing: BasicWorker (nothing for "operate, open"), Childcare (no
    // infant in the pack), DarkStudy (the "sacrifice" skull would say death,
    // not study) and Patient, for the reason above.
    private static readonly Dictionary<string, string> BadgeParTravail = new()
    {
        ["Art"] = "artist",                 ["Cleaning"] = "cleaner",
        ["Construction"] = "construction",  ["Cooking"] = "cooking",
        ["Crafting"] = "repairs",           ["Doctor"] = "doctor",
        ["Firefighter"] = "firefight",      ["Fishing"] = "fish",
        ["Growing"] = "planter",            ["Handling"] = "handle2",
        ["Hauling"] = "stonehauler",        ["Hunting"] = "shooter-primitive",
        ["Mining"] = "mining",              ["PatientBedRest"] = "bedrest",
        ["PlantCutting"] = "plantcutter",   ["Research"] = "research",
        ["Smithing"] = "smithing",          ["Tailoring"] = "sewing",
        ["Warden"] = "sheriff",
    };

    // ContentFinder is expensive and logs on every failure: it is called
    // only once per key, including when the answer is "nothing".
    private static readonly Dictionary<string, Texture2D> Cache = new();

    private static Texture2D Charger(string chemin)
    {
        if (Cache.TryGetValue(chemin, out var t)) return t;
        t = ContentFinder<Texture2D>.Get(chemin, false);
        Cache[chemin] = t;
        return t;
    }

    /// <summary>
    /// The icon to serve: the package's own if the player has it and the
    /// setting allows it, ours otherwise. The fallback is silent and
    /// automatic: a player who uninstalls Pawn Badge sees no gaps appear.
    /// </summary>
    private static Texture2D Resoudre(string defName, Dictionary<string, string> table,
                                      string dossierMaison)
    {
        if ((SkillIconsMod.Settings?.preferBadgeIcons ?? true)
            && table.TryGetValue(defName, out var badge))
        {
            var emprunt = Charger("PawnBadge/" + badge);
            if (emprunt != null) return emprunt;
        }
        return Charger(dossierMaison + "/" + defName);
    }

    public static Texture2D Pour(SkillDef def) =>
        def == null ? null : Resoudre(def.defName, BadgeParCompetence, "Skills");

    public static Texture2D Pour(WorkTypeDef def) =>
        def == null ? null : Resoudre(def.defName, BadgeParTravail, "WorkTypes");

    static SkillTypeIcons()
    {
        var harmony = new Harmony("nelim.skillicons.types");

        // The prefix SHRINKS the rect before letting the game draw inside
        // it. That is what makes the patch independent of DrawSkill's
        // internal layout: we do not look for where the label, the bar and
        // the passion icon are, we simply leave them less room.
        harmony.Patch(
            AccessTools.Method(typeof(SkillUI), nameof(SkillUI.DrawSkill), new[]
            {
                typeof(SkillRecord), typeof(Rect), typeof(SkillUI.SkillDrawMode), typeof(string)
            }),
            prefix: new HarmonyMethod(typeof(SkillTypeIcons), nameof(PrefixeCompetence)));

        // DoHeader may NOT be redeclared by the priority column: in that
        // case AccessTools falls back to PawnColumnWorker and we would patch
        // EVERY column, Name and Sex included. That is harmless - those
        // columns have no workType, the prefix hands control back at once -
        // but it is worth knowing, hence this note. And if the method is
        // still not found, nothing gets patched rather than letting Harmony
        // fail the whole static constructor, which would also take down the
        // passion icon patches.
        var entete = AccessTools.DeclaredMethod(typeof(PawnColumnWorker_WorkPriority), "DoHeader")
                  ?? AccessTools.Method(typeof(PawnColumnWorker), "DoHeader");
        if (entete == null)
            Log.Warning("[SkillIcons] DoHeader not found: Work tab column headers "
                + "will stay without an icon.");
        else
            harmony.Patch(entete,
                prefix: new HarmonyMethod(typeof(SkillTypeIcons), nameof(PrefixeEnteteTravail)));
    }

    public static void PrefixeCompetence(SkillRecord skill, ref Rect holdingRect)
    {
        if (SkillIconsMod.Settings?.showSkillIcons != true || skill?.def == null) return;
        var icone = Pour(skill.def);
        if (icone == null) return;

        const float taille = 20f, marge = 3f;
        var carre = new Rect(holdingRect.x, holdingRect.y + (holdingRect.height - taille) / 2f,
                             taille, taille);
        var avant = GUI.color;
        GUI.color = Color.white;
        GUI.DrawTexture(carre, icone);
        GUI.color = avant;
        holdingRect = new Rect(holdingRect.x + taille + marge, holdingRect.y,
                               holdingRect.width - taille - marge, holdingRect.height);
    }

    public const int EnteteIconeEtTexte = 0, EnteteIconeSeule = 1, EnteteTexteSeul = 2;

    /// <summary>
    /// Returning false stops the game from drawing its label: that is
    /// "icon only" mode. In the other two modes, control is handed back.
    /// </summary>
    public static bool PrefixeEnteteTravail(Rect rect, PawnColumnWorker __instance)
    {
        var reglages = SkillIconsMod.Settings;
        if (reglages?.showWorkTypeIcons != true
            || reglages.workTabHeaderMode == EnteteTexteSeul) return true;

        var travail = __instance?.def?.workType;
        var icone = Pour(travail);
        if (icone == null) return true;

        // The header is narrow and tall: the icon sits at the top, centred,
        // and the game's vertical label keeps whatever room is left below.
        var taille = Mathf.Min(rect.width - 2f, 22f);
        var carre = new Rect(rect.x + (rect.width - taille) / 2f, rect.yMax - taille - 2f,
                             taille, taille);
        var avant = GUI.color;
        GUI.color = Color.white;
        GUI.DrawTexture(carre, icone);
        GUI.color = avant;

        if (reglages.workTabHeaderMode == EnteteIconeSeule)
        {
            // We reproduce the one behaviour of the label the player is
            // deprived of: the tooltip, which says what the column does.
            if (travail != null)
            {
                TooltipHandler.TipRegion(rect, () => travail.gerundLabel.CapitalizeFirst()
                    + "\n\n" + travail.description, travail.shortHash);
            }
            return false;
        }
        return true;
    }
}
