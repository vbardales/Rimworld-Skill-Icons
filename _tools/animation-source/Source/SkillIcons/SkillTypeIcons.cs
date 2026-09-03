using System.Collections.Generic;
using HarmonyLib;
using RimWorld;
using UnityEngine;
using Verse;

namespace SkillIcons;

/// <summary>
/// Icônes de compétence et de type de travail — un jeu distinct de celui des
/// passions, et qui obéit à une règle inverse : la couleur appartient à la
/// passion, la forme à la compétence. Nos dessins sont donc monochromes.
///
/// Deux sources possibles. Si le joueur a « Pawn Badge - (MISC) Job Icons+
/// Revitalized », ce sont SES icônes qui sont servies : son interface parle
/// alors d'une seule voix. Sinon, les nôtres. Rien n'est recopié chez nous —
/// on lit ses textures à l'exécution, ce qui évite toute redistribution.
/// </summary>
[StaticConstructorOnStartup]
public static class SkillTypeIcons
{
    // Les correspondances ont été établies en REGARDANT les icônes, pas en
    // lisant leurs noms de fichiers, et selon une règle stricte : on associe
    // quand l'icône signifie la même chose, jamais quand elle y ressemble
    // seulement. « drugs » est une gélule, qui irait à merveille pour Patient,
    // mais elle veut dire « drogué » dans le paquet d'origine : la servir en
    // colonne Patient introduirait chez le joueur la confusion exacte qu'on
    // cherche à lui épargner. Patient garde donc notre dessin.
    private static readonly Dictionary<string, string> BadgeParCompetence = new()
    {
        ["Shooting"] = "shooter-modern",   ["Melee"] = "melee",
        ["Construction"] = "construction",  ["Mining"] = "mining",
        ["Cooking"] = "cooking",            ["Plants"] = "planter",
        ["Animals"] = "handle2",            ["Crafting"] = "repairs",
        ["Artistic"] = "artist",            ["Medicine"] = "doctor",
        ["Social"] = "dealmaker",           ["Intellectual"] = "research",
    };

    // Quatre types de travail n'ont AUCUN équivalent dans le paquet et gardent
    // notre dessin : BasicWorker (rien pour « actionner, ouvrir »), Childcare
    // (aucun nourrisson), DarkStudy (le crâne « sacrifice » dirait la mort, pas
    // l'étude) et Patient, pour la raison ci-dessus.
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

    // ContentFinder est coûteux et journalise à chaque échec : on ne l'appelle
    // qu'une fois par clé, y compris quand la réponse est « rien ».
    private static readonly Dictionary<string, Texture2D> Cache = new();

    private static Texture2D Charger(string chemin)
    {
        if (Cache.TryGetValue(chemin, out var t)) return t;
        t = ContentFinder<Texture2D>.Get(chemin, false);
        Cache[chemin] = t;
        return t;
    }

    /// <summary>
    /// L'icône à servir, celle du paquet si le joueur l'a et que le réglage le
    /// permet, la nôtre sinon. Le repli est silencieux et automatique : un
    /// joueur qui désinstalle Pawn Badge ne voit pas des trous apparaître.
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

        // Le préfixe RÉTRÉCIT le rectangle avant de laisser le jeu dessiner
        // dedans. C'est ce qui rend le correctif indépendant de la mise en page
        // interne de DrawSkill : on ne cherche pas où sont le libellé, la barre
        // et l'icône de passion, on leur laisse simplement moins de place.
        harmony.Patch(
            AccessTools.Method(typeof(SkillUI), nameof(SkillUI.DrawSkill), new[]
            {
                typeof(SkillRecord), typeof(Rect), typeof(SkillUI.SkillDrawMode), typeof(string)
            }),
            prefix: new HarmonyMethod(typeof(SkillTypeIcons), nameof(PrefixeCompetence)));

        // DoHeader peut n'être PAS redéclaré par la colonne de priorités : dans ce
        // cas AccessTools remonte à PawnColumnWorker et on patcherait TOUTES les
        // colonnes, y compris Nom et Sexe. Ce n'est pas grave — celles-là n'ont
        // pas de workType, le préfixe rend la main aussitôt — mais il faut le
        // savoir, donc on le dit. Et si la méthode reste introuvable, on ne
        // patche rien plutôt que de laisser Harmony faire échouer tout le
        // constructeur statique, ce qui emporterait aussi les icônes de passion.
        var entete = AccessTools.DeclaredMethod(typeof(PawnColumnWorker_WorkPriority), "DoHeader")
                  ?? AccessTools.Method(typeof(PawnColumnWorker), "DoHeader");
        if (entete == null)
            Log.Warning("[SkillIcons] DoHeader introuvable : les en-têtes de colonnes du Work Tab "
                + "resteront sans icône.");
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
    /// Renvoyer false empêche le jeu de dessiner son libellé : c'est le mode
    /// « icône seule ». Dans les deux autres modes on laisse la main.
    /// </summary>
    public static bool PrefixeEnteteTravail(Rect rect, PawnColumnWorker __instance)
    {
        var reglages = SkillIconsMod.Settings;
        if (reglages?.showWorkTypeIcons != true
            || reglages.workTabHeaderMode == EnteteTexteSeul) return true;

        var travail = __instance?.def?.workType;
        var icone = Pour(travail);
        if (icone == null) return true;

        // L'en-tête est étroit et haut : l'icône se pose en haut, centrée, et
        // le libellé vertical du jeu garde ce qui reste dessous.
        var taille = Mathf.Min(rect.width - 2f, 22f);
        var carre = new Rect(rect.x + (rect.width - taille) / 2f, rect.yMax - taille - 2f,
                             taille, taille);
        var avant = GUI.color;
        GUI.color = Color.white;
        GUI.DrawTexture(carre, icone);
        GUI.color = avant;

        if (reglages.workTabHeaderMode == EnteteIconeSeule)
        {
            // On reproduit le seul comportement du libellé dont on prive le
            // joueur : l'infobulle, qui dit ce que fait la colonne.
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
