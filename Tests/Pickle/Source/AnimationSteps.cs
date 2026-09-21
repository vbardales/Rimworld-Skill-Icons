using System;
using System.Linq;
using RimWorks.Pickle;
using VSE.Passions;
using Verse;

namespace SkillIcons.PickleSteps
{
    /// <summary>
    /// docs/TESTING.md Scenario 1's last leg: an icon that should animate visibly moves. It was
    /// the only check on this mod a person still had to make by eye, which made it the one most
    /// likely to be skipped on a suite that is green everywhere else - and a silently frozen
    /// animation is exactly the defect that would then ship.
    ///
    /// It does NOT capture the screen. Comparing screen pixels would answer a weaker question:
    /// anything moving anywhere in the captured rectangle passes it, a transparent window lets the
    /// map behind it move for you, and the result depends on where the window happens to sit. This
    /// asks the mod the same question the game asks it while drawing - what texture does this
    /// passion show right now - twice, a known number of frames apart. A running animation returns
    /// a different frame; a frozen one returns the same object.
    ///
    /// The negative step matters as much as the positive one. "The texture changed" on its own
    /// does not distinguish "the animation runs" from "something changed for another reason", so a
    /// passion with no animation must be shown NOT to change under exactly the same treatment.
    /// </summary>
    [PickleSteps]
    public class AnimationSteps
    {
        private static PassionDef Passion(PickleContext ctx, string defName)
        {
            var def = DefDatabase<PassionDef>.AllDefs.FirstOrDefault(d => d.defName == defName);
            ctx.Require(def != null, $"no PassionDef named '{defName}' is loaded");
            return def;
        }

        /// <summary>
        /// Reads PassionDef.Icon, which this mod postfixes to return the current animation frame.
        /// Going through the property rather than the mod's own cache is deliberate: it is the
        /// call site the game uses, so a patch that stopped applying fails here too.
        /// </summary>
        private static async System.Threading.Tasks.Task<(UnityEngine.Texture2D first, UnityEngine.Texture2D second)>
            TwoFrames(PickleContext ctx, PassionDef def, int frames)
        {
            var first = def.Icon;
            ctx.Require(first != null, $"'{def.defName}' has no icon at all, animated or not");
            await ctx.WaitFrames(frames);
            return (first, def.Icon);
        }

        [Then("SkillIcons passion {string} shows a different frame after {int} frames")]
        public async System.Threading.Tasks.Task Moves(PickleContext ctx, string defName, int frames)
        {
            var def = Passion(ctx, defName);
            var (first, second) = await TwoFrames(ctx, def, frames);
            ctx.Assert(!ReferenceEquals(first, second),
                $"'{defName}' drew the same texture ({first.name}) {frames} frames apart: its animation is not running");
        }

        [Then("SkillIcons passion {string} shows the same frame after {int} frames")]
        public async System.Threading.Tasks.Task DoesNotMove(PickleContext ctx, string defName, int frames)
        {
            var def = Passion(ctx, defName);
            var (first, second) = await TwoFrames(ctx, def, frames);
            ctx.Assert(ReferenceEquals(first, second),
                $"'{defName}' has no animation, yet it drew '{first.name}' then '{second.name}' {frames} frames apart - " +
                "so a changing texture here does not prove an animation is running");
        }
    }
}
