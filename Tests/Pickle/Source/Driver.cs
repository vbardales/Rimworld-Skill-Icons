using System;
using System.Reflection;
using RimWorks.Pickle;
using Verse;

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
        /// <summary>
        /// Every unguarded hop through reflection or through GetMod reports the same thing when it
        /// misses - "Object reference not set to an instance of an object" - and the report keeps
        /// no stack, so the 2026-09-20 WSL run could not say which of three hops had failed. These
        /// name themselves instead. Use them everywhere the steps leave the typed world.
        /// </summary>
        public static SkillIconsMod Mod(PickleContext ctx)
        {
            var mod = LoadedModManager.GetMod<SkillIconsMod>();
            ctx.Require(mod != null,
                "LoadedModManager.GetMod<SkillIconsMod>() returned nothing: SkillIcons.dll is not "
                + "loaded in this session, so no step can reach its settings");
            return mod;
        }

        public static FieldInfo Field(PickleContext ctx, Type owner, string name, BindingFlags flags)
        {
            var field = owner.GetField(name, flags);
            ctx.Require(field != null,
                $"{owner.FullName}.{name} no longer exists: the game or the mod renamed it, update the steps");
            return field;
        }

        public static PropertyInfo Property(PickleContext ctx, Type owner, string name, BindingFlags flags)
        {
            var property = owner.GetProperty(name, flags);
            ctx.Require(property != null,
                $"{owner.FullName}.{name} no longer exists: the game renamed it, update the steps");
            return property;
        }

        public static MethodInfo Method(PickleContext ctx, Type owner, string name, BindingFlags flags)
        {
            var method = owner.GetMethod(name, flags);
            ctx.Require(method != null,
                $"{owner.FullName}.{name}() no longer exists: the game renamed it, update the steps");
            return method;
        }

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
