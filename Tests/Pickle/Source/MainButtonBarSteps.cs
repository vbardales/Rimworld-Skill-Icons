using System.Linq;
using RimWorld;
using RimWorks.Pickle;
using Verse;

namespace SkillIcons.PickleSteps
{
    /// <summary>
    /// docs/TESTING.md Scenario 9's reveal-and-hide half, minus RIMMSQOL itself.
    ///
    /// What RIMMSQOL does when a player reveals this button is set MainButtonDef.buttonVisible and
    /// remember it. What THIS mod owes is the other side of that contract: hidden by default, and
    /// a def that takes its place in the bar properly once something reveals it - drawn, reachable
    /// and in its declared order - rather than one the bar refuses or draws greyed.
    ///
    /// So these steps move buttonVisible directly, which is the same field RIMMSQOL moves, and ask
    /// RimWorld's own MainButtonsRoot what it would draw. Nothing here installs, stages or drives
    /// RIMMSQOL: whether ITS interface can reveal the button, and whether ITS choice survives a
    /// restart, are RIMMSQOL's behaviour and stay in the manual table. Staging it would also mean
    /// mounting a mod the headless install does not carry, to test code that is not ours.
    /// </summary>
    [PickleSteps]
    public class MainButtonBarSteps
    {
        private static MainButtonDef Button(PickleContext ctx, string defName)
        {
            var def = DefDatabase<MainButtonDef>.GetNamedSilentFail(defName);
            ctx.Require(def != null, $"no MainButtonDef named '{defName}'");
            return def;
        }

        [When("SkillIcons reveals the MainButtonDef {string}, as a customization mod would")]
        public void Reveal(PickleContext ctx, string defName) => Button(ctx, defName).buttonVisible = true;

        [When("SkillIcons hides the MainButtonDef {string} again")]
        public void Hide(PickleContext ctx, string defName) => Button(ctx, defName).buttonVisible = false;

        /// <summary>
        /// MainButtonDef.Worker.Visible is what decides whether the bar draws a def at all, and
        /// Worker.Disabled is what greys it. Both are asserted: MOD_SETTINGS.md forbids a greyed
        /// shortcut as much as a visible one, and a def can be drawn and still be dead.
        /// </summary>
        [Then("SkillIcons MainButtonDef {string} is drawn in the bar")]
        public void AssertDrawn(PickleContext ctx, string defName)
        {
            var def = Button(ctx, defName);
            ctx.Assert(def.Worker.Visible, $"{defName} is in the bar but its worker reports Visible false");
            ctx.Assert(!def.Worker.Disabled, $"{defName} is drawn but greyed out, which MOD_SETTINGS.md forbids");
        }

        [Then("SkillIcons MainButtonDef {string} is not drawn in the bar")]
        public void AssertNotDrawn(PickleContext ctx, string defName)
        {
            var def = Button(ctx, defName);
            ctx.Assert(!def.Worker.Visible,
                $"{defName} reports Visible true with buttonVisible {def.buttonVisible}: it would show without being revealed");
        }
    }
}
