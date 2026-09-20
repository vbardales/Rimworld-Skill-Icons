using System;
using System.IO;
using System.Linq;
using RimWorld;
using RimWorks.Pickle;
using Verse;

namespace SkillIcons.PickleSteps
{
    /// <summary>
    /// The steps that exist to spare her the manual scenarios: docs/TESTING.md 5, 8, 9 and the
    /// half of 10 a running session can actually settle. Scenario 11 needs nothing here - Pickle's
    /// own generic def vocabulary asserts the patched fields directly, which is stronger evidence
    /// than a screenshot of a tooltip.
    ///
    /// Each one leaves the game as it found it. That matters more than usual here: Pickle runs
    /// every scenario in one session, so a step that switches the language or writes a settings
    /// file and does not put it back corrupts every scenario that follows it, and the failure
    /// would surface somewhere unrelated.
    /// </summary>
    [PickleSteps]
    public class VerificationSteps
    {
        // ---------------------------------------------------------------- Scenario 5
        [When("SkillIcons no-passion icon is turned {string}")]
        public void SetNonePassion(PickleContext ctx, string onOff)
        {
            ctx.Require(onOff == "on" || onOff == "off", $"write on or off, not '{onOff}'");
            Driver.Settings(ctx).showNonePassion = onOff == "on";
        }

        // ---------------------------------------------------------------- Scenario 8
        // Settings here are global, not per-save, so the round trip that matters is
        // object -> file -> object. A real restart is the one thing this cannot stand in for,
        // and the README says so rather than pretending otherwise.
        [When("SkillIcons settings are written to disk")]
        public void WriteSettings(PickleContext ctx)
        {
            LoadedModManager.GetMod<SkillIconsMod>().WriteSettings();
            ctx.Require(File.Exists(SettingsSandbox.SettingsFilePath),
                $"WriteSettings left no file at {SettingsSandbox.SettingsFilePath}");
        }

        [Then("the SkillIcons settings file records {string} as {string}")]
        public void AssertOnDisk(PickleContext ctx, string field, string expected)
        {
            var xml = File.ReadAllText(SettingsSandbox.SettingsFilePath);
            var needle = $"<{field}>{expected}</{field}>";
            ctx.Assert(xml.Contains(needle),
                $"the settings file does not contain {needle}. It holds:\n{xml}");
        }

        [When("SkillIcons settings are re-read from disk")]
        public void RereadSettings(PickleContext ctx)
        {
            var mod = LoadedModManager.GetMod<SkillIconsMod>();
            var fresh = LoadedModManager.ReadModSettings<SkillIconsSettings>(
                mod.Content.FolderName, mod.GetType().Name);
            ctx.Require(fresh != null, "ReadModSettings returned nothing");
            // Both references, for the reason SettingsSandbox.ResetToDefaults now spells out:
            // the drawing code reads the static, WriteSettings serialises the Mod's own field,
            // and letting them drift apart is exactly what made this scenario fail on 2026-09-20.
            typeof(SkillIconsMod).GetField("Settings", Driver.StaticAny).SetValue(null, fresh);
            typeof(Mod).GetField("modSettings", Driver.InstanceAny).SetValue(mod, fresh);
        }

        // ---------------------------------------------------------------- Scenario 9
        [Then("SkillIcons MainButtonDef {string} is hidden on a clean configuration")]
        public void AssertHidden(PickleContext ctx, string defName)
        {
            var def = DefDatabase<MainButtonDef>.GetNamedSilentFail(defName);
            ctx.Require(def != null, $"no MainButtonDef named '{defName}'");
            ctx.Assert(!def.buttonVisible,
                $"{defName}.buttonVisible is true: the shortcut would show without a "
                + "customization mod revealing it, which MOD_SETTINGS.md forbids");
        }

        /// <summary>
        /// Activates the def's own worker, which is what a customization mod's revealed button
        /// ends up calling. It does not prove RIMMSQOL can reveal it - that stays manual - but it
        /// does prove the shortcut opens the same dialog as the Options entry.
        /// </summary>
        [When("SkillIcons activates the MainButtonDef {string}")]
        public void ActivateShortcut(PickleContext ctx, string defName)
        {
            var def = DefDatabase<MainButtonDef>.GetNamedSilentFail(defName);
            ctx.Require(def != null, $"no MainButtonDef named '{defName}'");
            ctx.Require(def.Worker != null, $"{defName} has no worker: check workerClass");
            def.Worker.Activate();
        }

        [Then("SkillIcons sees a {string} window open for mod {string}")]
        public void AssertDialogFor(PickleContext ctx, string windowType, string modName)
        {
            var window = Find.WindowStack?.Windows?.FirstOrDefault(
                w => w.GetType().Name == windowType);
            ctx.Require(window != null, $"no {windowType} is open");

            // The dialog holds the Mod it was constructed with. Reading it back is what
            // distinguishes "a settings window opened" from "OUR settings window opened".
            var field = window.GetType().GetFields(Driver.InstanceAny)
                .FirstOrDefault(f => typeof(Mod).IsAssignableFrom(f.FieldType));
            ctx.Require(field != null, $"{windowType} holds no Mod field to check");
            var mod = field.GetValue(window) as Mod;
            ctx.Assert(mod != null && mod.Content?.Name == modName,
                $"{windowType} is open for '{mod?.Content?.Name ?? "nothing"}', expected '{modName}'");
        }

        // ---------------------------------------------------------------- Scenario 10, in part
        /// <summary>
        /// Switches the live language. Keyed text re-resolves immediately, which is what the
        /// settings page is made of, so a screenshot taken after this really is the French page.
        /// DefInjected does NOT re-resolve without a def reload, so the MainButtons shortcut's own
        /// label and description are out of this step's reach and stay manual.
        /// </summary>
        [When("SkillIcons sets the game language to {string}")]
        public void SetLanguage(PickleContext ctx, string folderName)
        {
            // RimWorld's language folders carry the native name too - "French (Français)",
            // "Spanish (Español(Castellano))" - so an exact match on "French" finds nothing.
            // Learned from the 2026-09-20 run, where this step failed and printed the real list.
            // Exact first so that "Russian" cannot accidentally take "Russian (Русский)".
            var all = LanguageDatabase.AllLoadedLanguages.ToList();
            var language = all.FirstOrDefault(l => l.folderName == folderName)
                ?? all.FirstOrDefault(l => l.folderName.StartsWith(folderName + " (", StringComparison.Ordinal));
            ctx.Require(language != null,
                $"'{folderName}' is not installed. Loaded: "
                + string.Join(", ", all.Select(l => l.folderName)));
            LanguageDatabase.SelectLanguage(language);
            ctx.Assert(LanguageDatabase.activeLanguage == language,
                $"the active language is still {LanguageDatabase.activeLanguage?.folderName}");
        }

        [Then("SkillIcons translation key {string} does not read as a raw key")]
        public void AssertTranslated(PickleContext ctx, string key)
        {
            var text = key.Translate().ToString();
            ctx.Assert(!string.IsNullOrWhiteSpace(text) && text != key,
                $"'{key}' resolved to '{text}': the key itself is what a player would see");
        }
    }
}
