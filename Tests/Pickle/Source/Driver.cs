using System.Reflection;
using RimWorks.Pickle;

namespace SkillIcons.PickleSteps
{
    /// <summary>Shared reflection helpers the step classes call into.</summary>
    public static class Driver
    {
        internal const BindingFlags StaticAny = BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic;
        internal const BindingFlags InstanceAny = BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic;

        /// <summary>
        /// SkillIconsMod.Settings is declared <c>internal</c> in SkillIcons.dll (see
        /// _tools/animation-source/Source/SkillIcons/SkillIconsMod.cs), so a companion assembly
        /// reaches it once by reflection. SkillIconsSettings itself, and every field on it, is
        /// public - once the object is in hand it is used like any other typed reference, no
        /// further reflection needed. Always re-read, never cached: SettingsSandbox.ResetToDefaults
        /// replaces the object wholesale between scenarios, and a step holding an old reference
        /// would silently mutate a settings object nothing draws from any more.
        /// </summary>
        public static SkillIconsSettings Settings(PickleContext ctx)
        {
            var field = typeof(SkillIconsMod).GetField("Settings", StaticAny);
            ctx.Require(field != null, "SkillIcons.SkillIconsMod.Settings no longer exists: update the steps");
            var value = field.GetValue(null) as SkillIconsSettings;
            ctx.Require(value != null, "SkillIconsMod.Settings is null: the mod has not finished loading");
            return value;
        }
    }
}
