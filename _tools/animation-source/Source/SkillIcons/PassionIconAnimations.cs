using System;
using System.Collections.Generic;
using System.Reflection;
using System.Reflection.Emit;
using HarmonyLib;
using RimWorld;
using UnityEngine;
using Verse;
using VSE.Passions;

namespace SkillIcons;

[StaticConstructorOnStartup]
public static class PassionIconAnimations
{
    private sealed class AnimationSpec
    {
        public readonly string assetKey;
        public readonly int frameCount;
        public readonly float framesPerSecond;

        public AnimationSpec(string assetKey, int frameCount, float framesPerSecond)
        {
            this.assetKey = assetKey;
            this.frameCount = frameCount;
            this.framesPerSecond = framesPerSecond;
        }
    }

    private static readonly Dictionary<string, AnimationSpec> Specs = new(StringComparer.Ordinal)
    {
        // La clé est le defName ; le premier champ est le nom des textures, qui
        // peut différer (deux degrés de "blind" partagent la même séquence).
        //
        // Cette table DOIT rester identique à SPECS dans _tools/gen.js. Un
        // compteur qui diverge fait retomber la passion sur son icône statique,
        // sans erreur ni message — c'est la panne la plus difficile à voir ici.

        // l'humeur parcourt l'échelle et revient à son cran
        ["AS_MoodyPassion"] = new("AS_MoodyPassion", 32, 6f),
        ["AS_MoodyPassion_Apathy"] = new("AS_MoodyPassion_Apathy", 32, 6f),
        ["AS_MoodyPassion_NoPassion"] = new("AS_MoodyPassion_NoPassion", 32, 6f),
        ["AS_MoodyPassion_Major"] = new("AS_MoodyPassion_Major", 32, 6f),
        ["AS_MoodyPassion_Greater"] = new("AS_MoodyPassion_Greater", 32, 6f),

        // un geste propre à chaque passion
        ["AS_BlindPassion_Elevated_Active"] = new("AS_BlindPassion_Active", 24, 12f),
        ["AS_BlindPassion_Sublime_Active"] = new("AS_BlindPassionSublime_Active", 24, 12f),
        ["AS_CompetitivePassion_Active"] = new("AS_CompetitivePassion", 16, 10f),
        ["AS_ForbiddenPassion"] = new("AS_ForbiddenPassion", 24, 10f),
        ["AS_FrozenPassion"] = new("AS_FrozenPassion", 24, 8f),
        ["AS_IdeologicalPassion_Active"] = new("AS_IdeologicalPassion_Active", 24, 10f),
        ["AS_IntimatePassion_Active"] = new("AS_IntimatePassion_Active", 24, 10f),
        ["AS_LikeMindedPassion"] = new("AS_LikeMindedPassion", 24, 8f),
        ["AS_NudistPassion_Active"] = new("AS_NudistPassion_Active", 24, 10f),
        ["AS_ObsessivePassion"] = new("AS_ObsessivePassion", 24, 8f),
        ["AS_PainDrivenPassion_Active"] = new("AS_PainDrivenPassion", 24, 10f),
        ["AS_RainyDayPassion_Active"] = new("AS_RainyDayPassion", 24, 12f),
        ["AS_SanguinePassion_Active"] = new("AS_SanguinePassion", 24, 10f),
        ["AS_StonedPassion_Active"] = new("AS_StonedPassion", 12, 8f),
        ["AS_SynergisticPassion"] = new("AS_SynergisticPassion", 24, 12f),
        ["AS_ToxicPassion_Active"] = new("AS_ToxicPassion", 40, 6f),
        ["AS_TranshumanistPassion_Active"] = new("AS_TranshumanistPassion_Active", 16, 10f),
        ["AS_TraumaticPassion"] = new("AS_TraumaticPassion", 16, 12f),
        ["AS_VengefulPassion_Active"] = new("AS_VengefulPassion", 16, 10f),
        ["AS_YouthPassion"] = new("AS_YouthPassion", 24, 8f),

        // gestes génériques
        ["AS_NightPassion_Active"] = new("AS_NightPassion", 16, 8f),
        ["AS_NomadicPassion_Active"] = new("AS_NomadicPassion", 16, 8f),
        ["AS_DrunkenPassion_Active"] = new("AS_DrunkenPassion", 16, 10f),
        ["AS_PsychicPassion"] = new("AS_PsychicPassion", 20, 6f),
        ["AS_PsychicPassion_Minor"] = new("AS_PsychicPassion_Minor", 20, 6f),
        ["AS_PsychicPassion_Nullified"] = new("AS_PsychicPassion_Nullified", 20, 6f),
        ["AS_PsychicPassion_Major"] = new("AS_PsychicPassion_Major", 20, 6f),
        ["AS_PsychicPassion_Critical"] = new("AS_PsychicPassion_Critical", 20, 6f),

        // la derniere passion d'Alpha Skills qui restait figee
        ["AS_DedicatedPassion"] = new("AS_DedicatedPassion", 16, 8f),
        ["AS_DuncePassion"] = new("AS_DuncePassion", 24, 8f),

        // et les passions de VSE, jusque-là toutes figées
        ["VSE_Critical"] = new("PassionCritical", 16, 10f),
        ["VSE_Natural"] = new("PassionNatural", 24, 8f),
        ["VSE_Apathy"] = new("PassionApathy", 48, 8f),
        ["Major"] = new("PassionMajor", 16, 10f),
        ["Minor"] = new("PassionMinor", 16, 8f)
    };

    private static readonly Dictionary<string, Texture2D[]> Frames = new(StringComparer.Ordinal);
    private static readonly HashSet<string> Missing = new(StringComparer.Ordinal);

    // Vanilla ne dessine rien pour "no passion" : VSE lui donne une texture
    // transparente. L'option remplace ce vide par un contour de cœur fantôme.
    private static Texture2D noneIcon;
    private static bool noneIconTried;
    private static Texture2D NoneIcon
    {
        get
        {
            if (noneIconTried) return noneIcon;
            noneIconTried = true;
            noneIcon = ContentFinder<Texture2D>.Get("Passions/PassionNone", false);
            return noneIcon;
        }
    }

    static PassionIconAnimations()
    {
        var harmony = new Harmony("nelim.skillicons");
        harmony.Patch(
            AccessTools.PropertyGetter(typeof(PassionDef), nameof(PassionDef.Icon)),
            postfix: new HarmonyMethod(typeof(PassionIconAnimations), nameof(IconPostfix)));

        var workTabTranspiler = new HarmonyMethod(typeof(WorkTabPassionAnimationPatch), nameof(WorkTabPassionAnimationPatch.Transpiler))
        {
            priority = Priority.Last,
            after = new[] { "vanillaexpanded.skills" }
        };
        harmony.Patch(
            AccessTools.Method(typeof(WidgetsWork), "DrawWorkBoxBackground"),
            transpiler: workTabTranspiler);

        var skillUiTranspiler = new HarmonyMethod(typeof(SkillUiPassionAnimationPatch), nameof(SkillUiPassionAnimationPatch.Transpiler))
        {
            priority = Priority.Last,
            after = new[] { "vanillaexpanded.skills" }
        };
        harmony.Patch(
            AccessTools.Method(typeof(SkillUI), nameof(SkillUI.DrawSkill), new[]
            {
                typeof(SkillRecord), typeof(Rect), typeof(SkillUI.SkillDrawMode), typeof(string)
            }),
            transpiler: skillUiTranspiler);
    }

    public static void IconPostfix(PassionDef __instance, ref Texture2D __result)
    {
        __result = AnimatedIconOrFallback(__instance, __result);
    }

    public static Texture2D WorkBoxAnimatedIcon(PassionDef passionDef)
    {
        if (passionDef == null) return null;
        // En couleur, on tire l'icône de la liste des compétences : c'est la
        // même image, simplement pas désaturée. Elle a toujours un iconPath,
        // là où workBoxIconPath manque sur certaines passions.
        if (EnCouleur(passionDef))
            return AnimatedIconOrFallback(passionDef, passionDef.Icon);
        // En gris, certaines passions n'ont pas de workBoxIconPath : y toucher
        // ferait japper ContentFinder à chaque frame.
        if (passionDef.workBoxIconPath.NullOrEmpty()) return null;
        return AnimatedIconOrFallback(passionDef, passionDef.WorkBoxIcon);
    }

    // Le mode mixte relit la règle du jeu d'icônes : une passion est « vive »
    // soit parce que son état déclenché est en cours, soit parce que son bonus
    // est permanent. Les autres dorment, et restent grises dans la grille.
    private static bool EnCouleur(PassionDef def)
    {
        switch (SkillIconsMod.Settings?.workTabMode ?? SkillIconsSettings.ModeMixte)
        {
            case SkillIconsSettings.ModeCouleur: return true;
            case SkillIconsSettings.ModeGris: return false;
            default: return def.isTriggered || def.learnRateFactor > 1f;
        }
    }

    // Remplace le GUI.DrawTexture que VSE injecte juste après avoir empilé
    // l'icône : c'est le seul endroit où l'on tient le rectangle de la case, et
    // donc le seul endroit où l'on peut l'agrandir.
    public static void DrawWorkBoxPassion(Rect rect, Texture texture)
    {
        if (texture == null) return;
        var s = SkillIconsMod.Settings?.workTabScale ?? 1f;
        if (s > 1.001f)
        {
            var centre = rect.center;
            rect = new Rect(0f, 0f, rect.width * s, rect.height * s) { center = centre };
        }

        // GUI.color est global : sans restauration, la teinte déteindrait sur
        // tout ce que RimWorld dessine ensuite dans la fenêtre.
        var avant = GUI.color;
        // Blanc franc, et pas avant.rgb : à ce point de DrawWorkBoxBackground,
        // vanilla a laissé dans GUI.color la teinte du fond de case, qui dépend
        // du niveau de compétence. Nos icônes étant colorées, cette teinte les
        // multiplie et écrase le bleu et le vert — la grille vire au rouge. Le
        // même raisonnement vaut pour l'alpha : l'opacité doit être celle du
        // réglage, pas celle du fondu de fond.
        GUI.color = new Color(1f, 1f, 1f, SkillIconsMod.Settings?.workTabOpacity ?? 1f);
        GUI.DrawTexture(rect, texture);
        GUI.color = avant;
    }

    public static Texture2D SkillUiAnimatedIcon(PassionDef passionDef)
    {
        if (passionDef == null) return null;
        return AnimatedIconOrFallback(passionDef, passionDef.Icon);
    }

    private static Texture2D AnimatedIconOrFallback(PassionDef passionDef, Texture2D fallback)
    {
        if (passionDef != null && passionDef.defName == "None")
            return SkillIconsMod.Settings?.showNonePassion == true && NoneIcon != null
                ? NoneIcon
                : fallback;

        if (SkillIconsMod.Settings?.enabled != true || passionDef == null ||
            !Specs.TryGetValue(passionDef.defName, out var spec)) return fallback;

        var frames = GetFrames(spec);
        if (frames == null || frames.Length == 0) return fallback;

        var speed = Mathf.Clamp(SkillIconsMod.Settings.speed, 0.5f, 1.5f);
        var index = Mathf.FloorToInt(Time.realtimeSinceStartup * spec.framesPerSecond * speed) % frames.Length;
        return frames[index];
    }

    private static Texture2D[] GetFrames(AnimationSpec spec)
    {
        if (Frames.TryGetValue(spec.assetKey, out var cached)) return cached;
        if (Missing.Contains(spec.assetKey)) return null;

        var loaded = new Texture2D[spec.frameCount];
        for (var i = 0; i < loaded.Length; i++)
        {
            var path = $"Passions/Animated/{spec.assetKey}_{i:00}";
            loaded[i] = ContentFinder<Texture2D>.Get(path, false);
            if (loaded[i] == null)
            {
                Missing.Add(spec.assetKey);
                return null;
            }
        }

        Frames[spec.assetKey] = loaded;
        return loaded;
    }
}

public static class WorkTabPassionAnimationPatch
{
    public static IEnumerable<CodeInstruction> Transpiler(IEnumerable<CodeInstruction> instructions)
    {
        var workBoxGetter = AccessTools.PropertyGetter(typeof(PassionDef), nameof(PassionDef.WorkBoxIcon));
        var animatedGetter = AccessTools.Method(typeof(PassionIconAnimations), nameof(PassionIconAnimations.WorkBoxAnimatedIcon));
        var ourDraw = AccessTools.Method(typeof(PassionIconAnimations),
            nameof(PassionIconAnimations.DrawWorkBoxPassion));

        // On ne fige PAS une surcharge précise de GUI.DrawTexture : le jeu et
        // VSE en ont changé d'une version à l'autre, et une signature qui ne
        // correspond plus fait échouer le détournement en silence. On accepte
        // donc toute surcharge dont les deux premiers paramètres sont
        // (Rect, Texture) — c'est le seul dessin d'icône possible ici.
        static bool EstDessinTexture(CodeInstruction ci)
        {
            if (ci.operand is not MethodInfo m) return false;
            if (m.DeclaringType != typeof(GUI) || m.Name != nameof(GUI.DrawTexture)) return false;
            // Exactement deux paramètres : notre méthode de remplacement en
            // prend deux, et dépiler autre chose corromprait la pile.
            var p = m.GetParameters();
            return p.Length == 2
                && p[0].ParameterType == typeof(Rect)
                && typeof(Texture).IsAssignableFrom(p[1].ParameterType);
        }

        // DrawWorkBoxBackground dessine aussi le fond de la case avec
        // GUI.DrawTexture : on ne détourne donc QUE le premier appel qui suit
        // l'icône de passion, jamais tous.
        var attendDessin = false;
        var remplaces = 0;
        var dessinsDetournes = 0;
        foreach (var instruction in instructions)
        {
            if (instruction.Calls(workBoxGetter))
            {
                instruction.opcode = OpCodes.Call;
                instruction.operand = animatedGetter;
                attendDessin = true;
                remplaces++;
            }
            else if (attendDessin && EstDessinTexture(instruction))
            {
                instruction.opcode = OpCodes.Call;
                instruction.operand = ourDraw;
                attendDessin = false;
                dessinsDetournes++;
            }
            yield return instruction;
        }

        // Sans ce garde-fou, l'échec est TOTALEMENT silencieux : l'onglet
        // Travail garde les icônes de VSE et rien n'indique pourquoi. Le cas
        // arrive si VSE cesse d'injecter WorkBoxIcon, ou si son patch passe
        // après le nôtre malgré le after = "vanillaexpanded.skills".
        if (remplaces == 0)
            Log.Warning("[SkillIcons] Aucun appel à PassionDef.WorkBoxIcon trouvé dans "
                + "DrawWorkBoxBackground : les icônes de l'onglet Travail resteront "
                + "celles de Vanilla Skills Expanded. Vérifiez que SkillIcons est bien "
                + "chargé après lui.");
        // Deux échecs distincts, deux messages : sans cela, une taille et une
        // opacité sans effet ressemblent exactement à un patch qui n'a pas pris.
        else if (dessinsDetournes == 0)
            Log.Warning("[SkillIcons] WorkBoxIcon détourné " + remplaces + " fois, mais aucun "
                + "appel de dessin reconnu derrière : les icônes de l'onglet Travail seront "
                + "les nôtres, sans les réglages de taille ni d'opacité.");
    }
}

public static class SkillUiPassionAnimationPatch
{
    public static IEnumerable<CodeInstruction> Transpiler(IEnumerable<CodeInstruction> instructions)
    {
        var iconGetter = AccessTools.PropertyGetter(typeof(PassionDef), nameof(PassionDef.Icon));
        var animatedGetter = AccessTools.Method(typeof(PassionIconAnimations), nameof(PassionIconAnimations.SkillUiAnimatedIcon));

        var remplaces = 0;
        foreach (var instruction in instructions)
        {
            if (instruction.Calls(iconGetter))
            {
                instruction.opcode = OpCodes.Call;
                instruction.operand = animatedGetter;
                remplaces++;
            }
            yield return instruction;
        }

        if (remplaces == 0)
            Log.Warning("[SkillIcons] Aucun appel à PassionDef.Icon trouvé dans "
                + "SkillUI.DrawSkill : la liste des compétences et la création de "
                + "colons garderont les icônes de Vanilla Skills Expanded.");
    }
}
