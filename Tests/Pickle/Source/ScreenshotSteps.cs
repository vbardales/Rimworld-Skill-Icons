using System;
using System.Collections.Generic;
using System.Linq;
using RimWorks.Pickle;
using UnityEngine;
using Verse;

namespace SkillIcons.PickleSteps
{
    /// <summary>
    /// Hides everything around the window being photographed, so a capture meant for a Workshop
    /// page does not carry the tab bar, the colonist bar, alerts, dev tools or Pickle's own runner
    /// panel. Technique passed on by the Work Studio session, 2026-09-20; the game already has the
    /// mechanism and this only drives it.
    ///
    /// How it works: RimWorld's own screenshot mode draws only the windows whose
    /// <c>Window.drawInScreenshotMode</c> is true, and nothing else of the interface. So the step
    /// raises that flag on the windows currently open, skipping any window that belongs to Pickle
    /// itself - matched on the declaring type's assembly name, because the runner panel is a
    /// perfectly ordinary Window and nothing else distinguishes it.
    ///
    /// Restoring matters more than it looks. A scenario that dies between hiding and restoring
    /// leaves the game with no interface at all, and every scenario after it in the same run
    /// photographs a blank screen. Hence both an explicit step and an [AfterScenario] that runs
    /// even when the scenario throws.
    /// </summary>
    [PickleSteps]
    public class ScreenshotSteps
    {
        private static readonly Dictionary<Window, bool> Previous = new Dictionary<Window, bool>();
        private static bool hiding;

        private static bool BelongsToPickle(Window w) =>
            w.GetType().Assembly.GetName().Name
             .StartsWith("RimWorks.Pickle", StringComparison.OrdinalIgnoreCase);

        [When("SkillIcons hides the interface around the windows on screen")]
        public void Hide(PickleContext ctx)
        {
            var root = Find.UIRoot;
            ctx.Require(root?.screenshotMode != null, "no UIRoot.screenshotMode to drive");

            Previous.Clear();
            var kept = 0;
            foreach (var w in Find.WindowStack.Windows.ToList())
            {
                Previous[w] = w.drawInScreenshotMode;
                var keep = !BelongsToPickle(w);
                w.drawInScreenshotMode = keep;
                if (keep) kept++;
            }
            ctx.Require(kept > 0,
                "every open window belongs to Pickle, so the capture would be empty - open the "
                + "window to photograph before hiding the interface");

            root.screenshotMode.Active = true;
            hiding = true;
        }

        [When("SkillIcons brings the interface back")]
        public void Restore(PickleContext ctx) => RestoreNow();

        [AfterScenario]
        public void RestoreAfterScenario(PickleContext ctx) => RestoreNow();

        /// <summary>
        /// Safe to call when nothing was hidden, which is the normal case for every scenario that
        /// never asked for a clean capture: the [AfterScenario] above runs for all of them.
        /// </summary>
        private static void RestoreNow()
        {
            if (!hiding) return;
            hiding = false;

            var root = Find.UIRoot;
            if (root?.screenshotMode != null) root.screenshotMode.Active = false;

            foreach (var pair in Previous)
            {
                // A window closed while hidden is gone from the stack but still in this map;
                // writing the field back on it is harmless and keeps the loop simple.
                if (pair.Key != null) pair.Key.drawInScreenshotMode = pair.Value;
            }
            Previous.Clear();
        }
    }
}
