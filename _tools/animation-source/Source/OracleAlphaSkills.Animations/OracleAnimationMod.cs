using UnityEngine;
using Verse;

namespace SkillIcons;

public sealed class OracleAnimationSettings : ModSettings
{
    public bool enabled = true;
    public float speed = 1f;

    public override void ExposeData()
    {
        Scribe_Values.Look(ref enabled, "enabled", true);
        Scribe_Values.Look(ref speed, "speed", 1f);
        speed = Mathf.Clamp(speed, 0.5f, 1.5f);
    }
}

public sealed class OracleAnimationMod : Mod
{
    internal static OracleAnimationSettings Settings;

    public OracleAnimationMod(ModContentPack content) : base(content)
    {
        Settings = GetSettings<OracleAnimationSettings>();
    }

    public override string SettingsCategory() => "SkillIcons";

    public override void DoSettingsWindowContents(Rect inRect)
    {
        var listing = new Listing_Standard();
        listing.Begin(inRect);
        listing.CheckboxLabeled("Animated passion icons", ref Settings.enabled,
            "Animate supported passion icons in both the Bio skill list and the Work tab.");
        listing.Gap();
        listing.Label("Animation speed: " + Settings.speed.ToString("0.0") + "x");
        Settings.speed = listing.Slider(Settings.speed, 0.5f, 1.5f);
        listing.End();
    }
}
