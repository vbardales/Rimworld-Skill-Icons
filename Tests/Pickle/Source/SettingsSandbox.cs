using System.IO;
using RimWorld;
using RimWorks.Pickle;
using Verse;

namespace SkillIcons.PickleSteps
{
    /// <summary>
    /// Every settings-changing step in this suite mutates SkillIconsSettings live, the same object
    /// DoSettingsWindowContents and the Harmony patches both read. Left alone that would leak into
    /// the player's own configuration file the moment anything calls WriteSettings (which
    /// Dialog_ModSettings does when it closes). Follows WorkStudio's and ArchitectStudio's own
    /// SettingsSandbox pattern: back up the real file before a scenario, restore it after. If the
    /// game dies mid-scenario the next run's IsolateSettings restores the backup first, exactly as
    /// the sibling suites' own comments describe.
    /// </summary>
    [PickleSteps]
    public class SettingsSandbox
    {
        // Guarded: an unguarded GetMod reports only "Object reference not set to an instance of an
        // object", and the report keeps no stack, so the 2026-09-20 run could not say which hop failed.
        private static Mod ModInstance(PickleContext ctx) => Driver.Mod(ctx);

        internal static string SettingsFilePath(PickleContext ctx) => SettingsPath(ctx);

        private static string SettingsPath(PickleContext ctx)
        {
            var mod = ModInstance(ctx);
            var method = Driver.Method(ctx, typeof(LoadedModManager), "GetSettingsFilename", Driver.StaticAny);
            return (string)method.Invoke(null, new object[] { mod.Content.FolderName, mod.GetType().Name });
        }

        private static string BackupPath(PickleContext ctx) => SettingsPath(ctx) + ".pickle-backup";

        [BeforeScenario]
        public void IsolateSettings(PickleContext ctx)
        {
            if (File.Exists(BackupPath(ctx)))
            {
                // Left behind by a run that never finished: the backup is the player's real file.
                RestoreFromBackup(ctx);
            }

            ModInstance(ctx).WriteSettings();
            if (File.Exists(SettingsPath(ctx)))
            {
                File.Copy(SettingsPath(ctx), BackupPath(ctx), overwrite: false);
            }

            ResetToDefaults(ctx);
        }

        [AfterScenario]
        public void RestoreSettings(PickleContext ctx)
        {
            if (File.Exists(BackupPath(ctx)))
            {
                RestoreFromBackup(ctx);
            }
        }

        /// <summary>
        /// The documented defaults - the same dictionary _tools/Run-Tests.ps1's own "a fresh
        /// SkillIconsSettings matches the documented defaults" test checks against the compiled
        /// DLL. A brand new instance already carries them via its field initializers.
        ///
        /// It has to be pointed at from BOTH places, and the 2026-09-20 run is why. The drawing
        /// code reads the static `SkillIconsMod.Settings`, but `Mod.WriteSettings()` serialises
        /// the Mod's own `modSettings` field - two references to what is normally one object.
        /// Repointing only the static left them disagreeing: every setting a step changed went to
        /// the static and drew correctly on screen, while `WriteSettings()` wrote the stale one,
        /// so `08-settings-persistence` read a file holding nothing it had just set. The scenario
        /// was right and the sandbox was wrong.
        /// </summary>
        public static void ResetToDefaults(PickleContext ctx)
        {
            var settings = new SkillIconsSettings();
            Adopt(ctx, settings);
            Driver.Field(ctx, typeof(SkillIconsMod), "Settings", Driver.StaticAny).SetValue(null, settings);
            Driver.Field(ctx, typeof(Mod), "modSettings", Driver.InstanceAny).SetValue(ModInstance(ctx), settings);
        }

        /// <summary>
        /// A ModSettings carries a reference back to the Mod that owns it, and the game sets it in
        /// GetSettings&lt;T&gt;(). An object built here with `new` has none, and ModSettings.Write()
        /// dereferences it: every scenario that wrote settings died on 2026-09-20 with
        /// "Object reference not set to an instance of an object", including the ones that only
        /// closed Dialog_ModSettings, since the dialog writes as it closes. Adopt the object before
        /// anything is allowed to hold it.
        /// </summary>
        private static void Adopt(PickleContext ctx, ModSettings settings)
        {
            // ModSettings.Mod is a property with a non-public setter, not a field: looking for a
            // field named "mod" finds nothing, and the guard then throws inside a [BeforeScenario]
            // hook, where Pickle reports only "Exception has been thrown by the target of an
            // invocation" - every scenario red, no message. Checked against the shipped assembly.
            Driver.Property(ctx, typeof(ModSettings), "Mod", Driver.InstanceAny)
                .SetValue(settings, ModInstance(ctx), null);
        }

        private static void RestoreFromBackup(PickleContext ctx)
        {
            File.Copy(BackupPath(ctx), SettingsPath(ctx), overwrite: true);
            File.Delete(BackupPath(ctx));

            var mod = ModInstance(ctx);
            // Forces the next GetSettings<T>() to actually reload from the file just restored,
            // instead of handing back the in-memory object the scenario mutated.
            Driver.Field(ctx, typeof(Mod), "modSettings", Driver.InstanceAny).SetValue(mod, null);
            var settings = mod.GetSettings<SkillIconsSettings>();
            Driver.Field(ctx, typeof(SkillIconsMod), "Settings", Driver.StaticAny).SetValue(null, settings);
        }
    }
}
