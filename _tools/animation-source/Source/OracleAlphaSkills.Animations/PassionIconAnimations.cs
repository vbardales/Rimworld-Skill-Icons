using System;
using System.Collections.Generic;
using HarmonyLib;
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
        ["AS_MoodyPassion"] = new("AS_MoodyPassion", 4, 4f),
        ["AS_MoodyPassion_Major"] = new("AS_MoodyPassion_Major", 4, 4f),
        ["AS_MoodyPassion_Greater"] = new("AS_MoodyPassion_Greater", 6, 5f),
        ["AS_NightPassion_Active"] = new("AS_NightPassion", 4, 3f),
        ["AS_RainyDayPassion_Active"] = new("AS_RainyDayPassion", 6, 6f),
        ["AS_PsychicPassion"] = new("AS_PsychicPassion", 4, 4f),
        ["AS_PsychicPassion_Major"] = new("AS_PsychicPassion_Major", 6, 6f),
        ["AS_PsychicPassion_Critical"] = new("AS_PsychicPassion_Critical", 6, 6f),
        ["AS_CompetitivePassion_Active"] = new("AS_CompetitivePassion", 6, 6f),
        ["AS_BlindPassion_Elevated_Active"] = new("AS_BlindPassion_Active", 4, 3f),
        ["AS_BlindPassion_Sublime_Active"] = new("AS_BlindPassion_Active", 4, 3f),
        ["AS_TranshumanistPassion_Active"] = new("AS_TranshumanistPassion_Active", 4, 5f),
        ["AS_YouthPassion"] = new("AS_YouthPassion", 4, 3f),
        ["AS_VengefulPassion_Active"] = new("AS_VengefulPassion", 4, 5f),
        ["AS_NomadicPassion_Active"] = new("AS_NomadicPassion", 8, 6f),
        ["AS_ToxicPassion_Active"] = new("AS_ToxicPassion", 6, 5f),
        ["AS_DrunkenPassion_Active"] = new("AS_DrunkenPassion", 6, 5f),
        ["AS_StonedPassion_Active"] = new("AS_StonedPassion", 6, 4f),
        ["AS_SanguinePassion_Active"] = new("AS_SanguinePassion", 6, 5f),
        ["AS_PainDrivenPassion_Active"] = new("AS_PainDrivenPassion", 4, 5f),
        ["AS_IdeologicalPassion_Active"] = new("AS_IdeologicalPassion_Active", 6, 5f),
        ["AS_IntimatePassion_Active"] = new("AS_IntimatePassion_Active", 6, 4f),
        ["AS_NudistPassion_Active"] = new("AS_NudistPassion_Active", 4, 3f)
    };

    private static readonly Dictionary<string, Texture2D[]> Frames = new(StringComparer.Ordinal);
    private static readonly HashSet<string> Missing = new(StringComparer.Ordinal);

    static PassionIconAnimations()
    {
        var harmony = new Harmony("oracle.skillicons.animations");
        harmony.Patch(
            AccessTools.PropertyGetter(typeof(PassionDef), nameof(PassionDef.Icon)),
            postfix: new HarmonyMethod(typeof(PassionIconAnimations), nameof(IconPostfix)));
        harmony.Patch(
            AccessTools.PropertyGetter(typeof(PassionDef), nameof(PassionDef.WorkBoxIcon)),
            postfix: new HarmonyMethod(typeof(PassionIconAnimations), nameof(IconPostfix)));
    }

    public static void IconPostfix(PassionDef __instance, ref Texture2D __result)
    {
        if (OracleAnimationMod.Settings?.enabled != true || __instance == null ||
            !Specs.TryGetValue(__instance.defName, out var spec)) return;

        var frames = GetFrames(spec);
        if (frames == null || frames.Length == 0) return;

        var speed = Mathf.Clamp(OracleAnimationMod.Settings.speed, 0.5f, 1.5f);
        var index = Mathf.FloorToInt(Time.realtimeSinceStartup * spec.framesPerSecond * speed) % frames.Length;
        __result = frames[index];
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
