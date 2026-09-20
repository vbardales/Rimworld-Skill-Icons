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
        private static Mod ModInstance => LoadedModManager.GetMod<SkillIconsMod>();

        internal static string SettingsFilePath => SettingsPath;

        private static string SettingsPath
        {
            get
            {
                var mod = ModInstance;
                var method = typeof(LoadedModManager).GetMethod("GetSettingsFilename", Driver.StaticAny);
                return (string)method.Invoke(null, new object[] { mod.Content.FolderName, mod.GetType().Name });
            }
        }

        private static string BackupPath => SettingsPath + ".pickle-backup";

        [BeforeScenario]
        public void IsolateSettings(PickleContext ctx)
        {
            if (File.Exists(BackupPath))
            {
                // Left behind by a run that never finished: the backup is the player's real file.
                RestoreFromBackup();
            }

            ModInstance.WriteSettings();
            if (File.Exists(SettingsPath))
            {
                File.Copy(SettingsPath, BackupPath, overwrite: false);
            }

            ResetToDefaults();
        }

        [AfterScenario]
        public void RestoreSettings(PickleContext ctx)
        {
            if (File.Exists(BackupPath))
            {
                RestoreFromBackup();
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
        public static void ResetToDefaults()
        {
            var settings = new SkillIconsSettings();
            typeof(SkillIconsMod).GetField("Settings", Driver.StaticAny).SetValue(null, settings);
            typeof(Mod).GetField("modSettings", Driver.InstanceAny).SetValue(ModInstance, settings);
        }

        private static void RestoreFromBackup()
        {
            File.Copy(BackupPath, SettingsPath, overwrite: true);
            File.Delete(BackupPath);

            var mod = ModInstance;
            // Forces the next GetSettings<T>() to actually reload from the file just restored,
            // instead of handing back the in-memory object the scenario mutated.
            typeof(Mod).GetField("modSettings", Driver.InstanceAny).SetValue(mod, null);
            var settings = mod.GetSettings<SkillIconsSettings>();
            typeof(SkillIconsMod).GetField("Settings", Driver.StaticAny).SetValue(null, settings);
        }
    }
}
