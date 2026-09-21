using System;
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

        }

        /// <summary>
        /// Set by a step, never by a hook, and that is the whole point. Pickle collects hooks with
        /// an additive tag filter - an untagged [BeforeScenario] runs for every scenario and a
        /// tagged one is added on top - and it invokes them in GetMethods order, which .NET does
        /// not guarantee. So a tagged hook cannot silence the general one, and a flag set by one
        /// hook for another to read would depend on reflection order. Steps have no such problem:
        /// they always run after the before-hooks and before the after-hooks. Technique found by
        /// the Pickle headless session, reading RunSession.RunBeforeHooks.
        /// </summary>
        private static bool keepForNextProcess;

        /// <summary>
        /// For the restart pair only: the settings file this scenario leaves behind is what the
        /// NEXT process must start from, so the teardown has to keep its hands off it. The
        /// scenario asking for it says so in its own Background, where whoever reads the feature
        /// will see it - unlike a launcher flag, which is invisible from the test that depends
        /// on it.
        /// </summary>
        [Given("SkillIcons settings are kept for the next process")]
        public void KeepSettings(PickleContext ctx) => keepForNextProcess = true;

        [AfterScenario]
        public void RestoreSettings(PickleContext ctx)
        {
            if (keepForNextProcess)
            {
                // Consumed here rather than reset at the start of the next scenario: the flag
                // cannot then leak into a scenario that never asked for it.
                keepForNextProcess = false;

                // And the backup goes with it. Left in place, the NEXT process's first
                // [BeforeScenario] would read it as "a run that never finished" and restore it
                // over the very file this scenario was asked to leave behind - undoing the whole
                // point one process later, where nothing would connect the two.
                if (File.Exists(BackupPath(ctx))) { File.Delete(BackupPath(ctx)); }

                // Names THIS process, so a later one can tell the file it inherited from the file
                // it is running under. See DiscardOrphanedKeep.
                File.WriteAllText(KeptMarkerPath(ctx), ProcessId);
                return;
            }

            if (DiscardOrphanedKeep(ctx)) return;

            if (File.Exists(BackupPath(ctx)))
            {
                RestoreFromBackup(ctx);
            }
        }

        /// <summary>
        /// Identifies this game process. Two launches never share it, which is what lets a marker
        /// written by one be recognised as inherited by the other.
        /// </summary>
        private static readonly string ProcessId = Guid.NewGuid().ToString("N");

        private static string KeptMarkerPath(PickleContext ctx) => SettingsPath(ctx) + ".pickle-kept";

        /// <summary>
        /// The restart pair leaves a settings file behind on purpose, for a second process to read.
        /// If that second process never comes - the machine gets reserved, the queue is long, a
        /// session is interrupted - nothing else would ever put the file back: the keep step
        /// deleted the backup exactly so it could not be restored over the kept values, and the
        /// WSL install would sit in grey mode with animations off until someone noticed.
        ///
        /// It cannot be decided in [BeforeScenario], because there the scenario about to run might
        /// be the very reader the file was kept for. It can be decided here: the reader consumes
        /// the marker in its own first step, so a marker still standing after a scenario has run,
        /// written by ANOTHER process, belongs to a scenario that was not the reader. That
        /// scenario has just run under values it never asked for - each of them resets in its own
        /// Background, so nothing it asserted was affected - and the file is put back to defaults
        /// now rather than left for the next run to inherit.
        /// </summary>
        private static bool DiscardOrphanedKeep(PickleContext ctx)
        {
            var marker = KeptMarkerPath(ctx);
            if (!File.Exists(marker) || File.ReadAllText(marker) == ProcessId) return false;

            ResetToDefaults(ctx);
            ModInstance(ctx).WriteSettings();
            File.Delete(marker);
            if (File.Exists(BackupPath(ctx))) { File.Delete(BackupPath(ctx)); }
            return true;
        }

        /// <summary>
        /// First step of the reader. Refuses to pass when the writer ran in THIS process, because
        /// that would be a restart test that never restarted - the in-memory object would still
        /// hold the values and every assertion after it would be true for the wrong reason.
        /// Consumes the marker and the backup: what the reader leaves behind, it leaves on purpose.
        /// </summary>
        [Given("SkillIcons reads what the previous process kept")]
        public void ReadKept(PickleContext ctx)
        {
            var marker = KeptMarkerPath(ctx);
            ctx.Require(File.Exists(marker),
                "no settings were kept by an earlier process: run 12-restart-write.feature first, in its own launch");
            ctx.Require(File.ReadAllText(marker) != ProcessId,
                "the writer ran in THIS process, so this is not a restart: launch it as a separate run");
            File.Delete(marker);
            if (File.Exists(BackupPath(ctx))) { File.Delete(BackupPath(ctx)); }
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
