using System;
using RimWorld;
using RimWorks.Pickle;
using Verse;

namespace SkillIcons.PickleSteps
{
    /// <summary>
    /// Everything docs/TESTING.md Scenarios 2, 3, 4 and 7 need that Pickle's own generic
    /// vocabulary does not already cover: opening the real Dialog_ModSettings the primary Options
    /// entry itself opens, and writing SkillIconsSettings' fields directly - the same fields
    /// _tools/Run-Tests.ps1 already proves the clamps and defaults for out of game.
    /// </summary>
    [PickleSteps]
    public class SettingsSteps
    {
        /// <summary>
        /// Waits for its own frames rather than leaving that to the scenario. Dialog_ModSettings
        /// force-pauses the game, so a tick wait written in the scenario can never be satisfied -
        /// it times out, which is how this scenario failed twice before the wait was removed
        /// entirely. Frames still pass while the game is paused, so waiting here is both correct
        /// and invisible to the scenario. Technique passed on by the Work Studio session.
        /// </summary>
        [When("I open the SkillIcons settings dialog")]
        public async System.Threading.Tasks.Task OpenDialog(PickleContext ctx)
        {
            var mod = LoadedModManager.GetMod<SkillIconsMod>();
            ctx.Require(mod != null, "SkillIcons is not a loaded mod");
            Find.WindowStack.Add(new Dialog_ModSettings(mod));
            await ctx.WaitFrames(3);
        }

        [Given("SkillIcons settings are at their documented defaults")]
        public void ResetToDefaults(PickleContext ctx) => SettingsSandbox.ResetToDefaults(ctx);

        [When("SkillIcons work tab mode is set to {string}")]
        public void SetWorkTabMode(PickleContext ctx, string mode)
        {
            var settings = Driver.Settings(ctx);
            settings.workTabMode = mode.ToLowerInvariant() switch
            {
                "colour" or "color" => SkillIconsSettings.ModeCouleur,
                "grey" or "gray" or "greyed" => SkillIconsSettings.ModeGris,
                "mixed" => SkillIconsSettings.ModeMixte,
                _ => throw new ArgumentException($"'{mode}' is not colour, grey or mixed")
            };
        }


        [When("SkillIcons work tab icon size is set to {int} percent")]
        public void SetScale(PickleContext ctx, int percent) => Driver.Settings(ctx).workTabScale = percent / 100f;

        [When("SkillIcons work tab icon opacity is set to {int} percent")]
        public void SetOpacity(PickleContext ctx, int percent) => Driver.Settings(ctx).workTabOpacity = percent / 100f;

        [When("SkillIcons animated passion icons is turned {string}")]
        public void SetAnimated(PickleContext ctx, string onOff)
        {
            ctx.Require(onOff == "on" || onOff == "off", $"write on or off, not '{onOff}'");
            Driver.Settings(ctx).enabled = onOff == "on";
        }

        [Then("SkillIcons setting {string} reads {string}")]
        public void AssertSetting(PickleContext ctx, string field, string expected)
        {
            var settings = Driver.Settings(ctx);
            var f = typeof(SkillIconsSettings).GetField(field);
            ctx.Require(f != null, $"SkillIconsSettings has no field '{field}'");
            var actual = f.GetValue(settings)?.ToString();
            ctx.Assert(actual == expected, $"SkillIconsSettings.{field} reads '{actual}', expected '{expected}'");
        }
    }
}
