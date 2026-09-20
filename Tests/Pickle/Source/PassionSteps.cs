using System;
using System.Linq;
using RimWorld;
using RimWorks.Pickle;
using Verse;
using VSE.Passions;

namespace SkillIcons.PickleSteps
{
    /// <summary>
    /// Setting a colonist's skill passion state. Pickle's own generic vocabulary
    /// (Pickle/Features/pawn-steps.feature, "X" skill "Shooting" is set to level 12) sets a
    /// skill's LEVEL but has no equivalent for passion state, so this file fills that one gap.
    ///
    /// Two distinct mechanisms are in play here, and this comment is deliberately explicit about
    /// which is which, because only one of them is fully under this suite's control:
    ///
    ///  - Vanilla's own Passion enum (None/Minor/Major, RimWorld.SkillRecord.passion) is the one
    ///    axis every RimWorld installation has, whatever mods are present. Setting it is a plain
    ///    public field write and is not in question.
    ///
    ///  - Vanilla Skills Expanded's and Alpha Skills' own richer PassionDefs - the heart-shaped set
    ///    this mod actually themes - are layered on top, and some of them (about twenty, confirmed
    ///    by reflection against the installed VSE.dll/AlphaSkills.dll while writing this file) are
    ///    driven by a HediffComp that decides, moment to moment, from the pawn's REAL state -
    ///    "is this pawn actually nude right now", "is this pawn actually in pain right now" - and
    ///    so on, whether the "_Active"/triggered variant currently applies. GrantPassionDef below
    ///    adds the Hediff PassionDef.hediffToAdd names, which is the honest limit of what a
    ///    scenario can force without also faking each of those twenty different real-world
    ///    conditions: it makes the passion type assigned and its own comp running, free to decide -
    ///    it does NOT and cannot guarantee the def ends up in its triggered state. That is
    ///    confirmed only by static reflection against the installed assemblies, never by seeing it
    ///    actually draw; say so wherever a feature file uses this step, not just here.
    /// </summary>
    [PickleSteps]
    public class PassionSteps
    {
        [Given("SkillIcons sets {string} skill {string} passion to {string}")]
        public void SetPassion(PickleContext ctx, string nickname, string skillDefName, string level)
        {
            var skill = Skill(ctx, nickname, skillDefName);
            ctx.Require(Enum.TryParse(level, true, out Passion passion),
                $"'{level}' is not a Passion - write None, Minor or Major");
            skill.passion = passion;
            ctx.Assert(skill.passion == passion,
                $"setting '{skillDefName}' passion on '{nickname}' did not stick: reads {skill.passion}");
        }

        [Given("SkillIcons clears {string} skill {string} passion")]
        public void ClearPassion(PickleContext ctx, string nickname, string skillDefName)
        {
            Skill(ctx, nickname, skillDefName).passion = Passion.None;
        }

        /// <summary>
        /// Assigns a real, installed PassionDef (by defName, e.g. "VSE_Natural" or
        /// "AS_NudistPassion") to a skill: sets a vanilla passion level so VSE's own drawing code
        /// treats the skill as passionate at all (without that, nothing this mod patches runs for
        /// this skill regardless of which def exists), then grants the def's own Hediff if it
        /// declares one. See the file header for what this does and does not prove about the
        /// triggered/dormant state.
        /// </summary>
        [Given("SkillIcons grants {string} skill {string} the passion def {string}")]
        public void GrantPassionDef(PickleContext ctx, string nickname, string skillDefName, string passionDefName)
        {
            var pawn = Colonist(ctx, nickname);
            var skill = Skill(ctx, nickname, skillDefName);
            var def = DefDatabase<PassionDef>.GetNamedSilentFail(passionDefName);
            ctx.Require(def != null, $"no PassionDef is named '{passionDefName}'; installed: " +
                string.Join(", ", DefDatabase<PassionDef>.AllDefsListForReading.Select(d => d.defName)));

            skill.passion = def.learnRateFactor > 1f || def.isTriggered ? Passion.Major : Passion.Minor;

            if (def.hediffToAdd != null)
            {
                var hediff = HediffMaker.MakeHediff(def.hediffToAdd, pawn);
                pawn.health.AddHediff(hediff);
                ctx.Require(pawn.health.hediffSet.HasHediff(def.hediffToAdd),
                    $"granting '{def.hediffToAdd.defName}' to '{nickname}' did not take");
            }
        }

        internal static Pawn Colonist(PickleContext ctx, string nickname)
        {
            var pawn = PawnsFinder.AllMaps_FreeColonists.FirstOrDefault(p =>
                string.Equals(p.Name?.ToStringShort, nickname, StringComparison.OrdinalIgnoreCase));
            ctx.Require(pawn != null, $"no free colonist is called '{nickname}'");
            return pawn;
        }

        private static SkillRecord Skill(PickleContext ctx, string nickname, string skillDefName)
        {
            var pawn = Colonist(ctx, nickname);
            var def = DefDatabase<SkillDef>.GetNamedSilentFail(skillDefName);
            ctx.Require(def != null, $"no skill is named '{skillDefName}'");
            var record = pawn.skills?.GetSkill(def);
            ctx.Require(record != null, $"'{nickname}' has no skill record for '{skillDefName}'");
            return record;
        }
    }
}
