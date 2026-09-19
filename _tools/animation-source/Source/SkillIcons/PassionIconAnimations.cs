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
        // The key is the defName; the first field is the texture name, which
        // can differ (two degrees of "blind" share the same sequence).
        //
        // This table MUST stay identical to SPECS in _tools/gen.js. A count
        // that drifts falls the passion back to its static icon, with no
        // error or message - the hardest failure to spot here.

        // mood runs the whole scale and returns to its notch
        ["AS_MoodyPassion"] = new("AS_MoodyPassion", 32, 6f),
        ["AS_MoodyPassion_Apathy"] = new("AS_MoodyPassion_Apathy", 32, 6f),
        ["AS_MoodyPassion_NoPassion"] = new("AS_MoodyPassion_NoPassion", 32, 6f),
        ["AS_MoodyPassion_Major"] = new("AS_MoodyPassion_Major", 32, 6f),
        ["AS_MoodyPassion_Greater"] = new("AS_MoodyPassion_Greater", 32, 6f),

        // a gesture of its own for each passion
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

        // generic gestures
        ["AS_NightPassion_Active"] = new("AS_NightPassion", 16, 8f),
        ["AS_NomadicPassion_Active"] = new("AS_NomadicPassion", 16, 8f),
        ["AS_DrunkenPassion_Active"] = new("AS_DrunkenPassion", 16, 10f),
        ["AS_PsychicPassion"] = new("AS_PsychicPassion", 20, 6f),
        ["AS_PsychicPassion_Minor"] = new("AS_PsychicPassion_Minor", 20, 6f),
        ["AS_PsychicPassion_Nullified"] = new("AS_PsychicPassion_Nullified", 20, 6f),
        ["AS_PsychicPassion_Major"] = new("AS_PsychicPassion_Major", 20, 6f),
        ["AS_PsychicPassion_Critical"] = new("AS_PsychicPassion_Critical", 20, 6f),

        // the last Alpha Skills passion that was still frozen
        ["AS_DedicatedPassion"] = new("AS_DedicatedPassion", 16, 8f),
        ["AS_DuncePassion"] = new("AS_DuncePassion", 24, 8f),

        // and VSE's own passions, all of them frozen until now
        ["VSE_Critical"] = new("PassionCritical", 16, 10f),
        ["VSE_Natural"] = new("PassionNatural", 24, 8f),
        ["VSE_Apathy"] = new("PassionApathy", 48, 8f),
        ["Major"] = new("PassionMajor", 16, 10f),
        ["Minor"] = new("PassionMinor", 16, 8f)
    };

    private static readonly Dictionary<string, Texture2D[]> Frames = new(StringComparer.Ordinal);
    private static readonly HashSet<string> Missing = new(StringComparer.Ordinal);

    // Vanilla draws nothing at all for "no passion": VSE gives it a
    // transparent texture. The option replaces that emptiness with a ghost
    // heart outline.
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
        // In colour, the icon is pulled from the skill list: it is the same
        // image, simply not desaturated. It always has an iconPath, whereas
        // workBoxIconPath is missing on some passions.
        if (EnCouleur(passionDef))
            return AnimatedIconOrFallback(passionDef, passionDef.Icon);
        // In grey, some passions have no workBoxIconPath: touching it would
        // make ContentFinder yelp on every frame.
        if (passionDef.workBoxIconPath.NullOrEmpty()) return null;
        // animate: false is load-bearing. Every animation frame is drawn in
        // COLOUR - there is no grey frame set - so letting the animation win
        // here returns a coloured frame and silently undoes the mode: colour,
        // greyed and mixed then all draw the same thing for the forty animated
        // passions, which is exactly what the 2026-09-19 screenshots showed.
        // An asleep bonus therefore sits still, which also reads better than a
        // grey icon animating.
        return AnimatedIconOrFallback(passionDef, passionDef.WorkBoxIcon, animate: false);
    }

    // Mixed mode re-reads the icon set's own rule: a passion is "live"
    // either because its triggered state is active, or because its bonus is
    // permanent. Every other one is asleep, and stays grey in the grid.
    private static bool EnCouleur(PassionDef def)
    {
        switch (SkillIconsMod.Settings?.workTabMode ?? SkillIconsSettings.ModeMixte)
        {
            case SkillIconsSettings.ModeCouleur: return true;
            case SkillIconsSettings.ModeGris: return false;
            default: return def.isTriggered || def.learnRateFactor > 1f;
        }
    }

    // Replaces the GUI.DrawTexture call VSE injects right after pushing the
    // icon: it is the only place where the cell's rect is available, and
    // therefore the only place where it can be enlarged.
    public static void DrawWorkBoxPassion(Rect rect, Texture texture)
    {
        if (texture == null) return;
        var s = SkillIconsMod.Settings?.workTabScale ?? 1f;
        if (s > 1.001f)
        {
            var centre = rect.center;
            rect = new Rect(0f, 0f, rect.width * s, rect.height * s) { center = centre };
        }

        // GUI.color is global: without restoring it, the tint would bleed
        // into everything RimWorld draws next in the window.
        var avant = GUI.color;
        // Plain white, not avant.rgb: at this point in DrawWorkBoxBackground,
        // vanilla has left the work box's background tint in GUI.color,
        // which depends on skill level. Since our icons are coloured, that
        // tint multiplies them and crushes blue and green - the whole grid
        // turns red. The same reasoning applies to alpha: opacity must be
        // the slider's, not the background fade's.
        GUI.color = new Color(1f, 1f, 1f, SkillIconsMod.Settings?.workTabOpacity ?? 1f);
        GUI.DrawTexture(rect, texture);
        GUI.color = avant;
    }

    public static Texture2D SkillUiAnimatedIcon(PassionDef passionDef)
    {
        if (passionDef == null) return null;
        return AnimatedIconOrFallback(passionDef, passionDef.Icon);
    }

    /// <param name="animate">
    /// False asks for the texture handed in, never an animation frame. The
    /// work tab's grey mode needs this: the frames only exist in colour.
    /// </param>
    private static Texture2D AnimatedIconOrFallback(PassionDef passionDef, Texture2D fallback,
                                                    bool animate = true)
    {
        if (passionDef != null && passionDef.defName == "None")
            return SkillIconsMod.Settings?.showNonePassion == true && NoneIcon != null
                ? NoneIcon
                : fallback;

        if (!animate) return fallback;

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

        // We do NOT pin down one exact GUI.DrawTexture overload: the game and
        // VSE have both changed it from one version to the next, and a
        // signature that no longer matches makes the hijack fail silently.
        // We therefore accept any overload whose first two parameters are
        // (Rect, Texture) - the only icon draw call possible here.
        static bool EstDessinTexture(CodeInstruction ci)
        {
            if (ci.operand is not MethodInfo m) return false;
            if (m.DeclaringType != typeof(GUI) || m.Name != nameof(GUI.DrawTexture)) return false;
            // Exactly two parameters: our replacement method takes two, and
            // popping anything else would corrupt the stack.
            var p = m.GetParameters();
            return p.Length == 2
                && p[0].ParameterType == typeof(Rect)
                && typeof(Texture).IsAssignableFrom(p[1].ParameterType);
        }

        // DrawWorkBoxBackground also draws the cell's background with
        // GUI.DrawTexture: we therefore hijack ONLY the first call that
        // follows the passion icon, never all of them.
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

        // Without this guard, the failure is COMPLETELY silent: the Work tab
        // keeps VSE's icons and nothing says why. This happens if VSE stops
        // injecting WorkBoxIcon, or if its patch runs after ours despite
        // after = "vanillaexpanded.skills".
        if (remplaces == 0)
            Log.Warning("[SkillIcons] No call to PassionDef.WorkBoxIcon found in "
                + "DrawWorkBoxBackground: the Work tab icons will stay Vanilla "
                + "Skills Expanded's own. Check that SkillIcons is loaded after it.");
        // Two distinct failures, two messages: without this, size and
        // opacity having no effect looks exactly like a patch that did not
        // take at all.
        else if (dessinsDetournes == 0)
            Log.Warning("[SkillIcons] WorkBoxIcon hijacked " + remplaces + " times, but no "
                + "recognised draw call followed: the Work tab icons will be ours, "
                + "without the size or opacity settings.");
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
            Log.Warning("[SkillIcons] No call to PassionDef.Icon found in "
                + "SkillUI.DrawSkill: the skill list and pawn creation screen "
                + "will keep Vanilla Skills Expanded's own icons.");
    }
}
