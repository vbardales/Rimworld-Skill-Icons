using System.IO;
using System.Linq;
using System.Xml.Linq;
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

        /// <summary>
        /// Waits a few frames after moving the field, because the bar redraws on its own schedule and a
        /// screenshot taken the same frame would show the bar as it was.
        /// </summary>
        [When("SkillIcons reveals the MainButtonDef {string}, as a customization mod would")]
        public async System.Threading.Tasks.Task Reveal(PickleContext ctx, string defName)
        {
            Button(ctx, defName).buttonVisible = true;
            await ctx.WaitFrames(10);
        }

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

        /// <summary>
        /// The description a player sees in the bar is the def's own, after DefInjected has been applied
        /// for the language the game STARTED in. That is why this can be asserted here at all: it used to
        /// be filed as unreachable because DefInjected does not re-resolve when a language is switched
        /// mid-run, and a launch that chooses its language does not switch anything.
        ///
        /// French: the text must be exactly what Languages/French/DefInjected says, and must differ from the
        /// English source - a description that still reads as English in a French game is a def that was
        /// never injected. Any other language: it must be non-empty and must not be the French text.
        /// </summary>
        [Then("SkillIcons MainButtonDef {string} carries its description for the active language")]
        public void AssertDescriptionForLanguage(PickleContext ctx, string defName)
        {
            var def = Button(ctx, defName);
            var root = Driver.Mod(ctx).Content.RootDir;
            var french = ReadInjected(ctx, Path.Combine(root, "Languages", "French", "DefInjected", "MainButtonDef", "MainButtons.xml"), defName + ".description");
            var active = LanguageDatabase.activeLanguage?.folderName ?? "";
            ctx.Require(!string.IsNullOrWhiteSpace(def.description), $"{defName} has an empty description in the language '{active}'");

            if (active.StartsWith("French"))
            {
                ctx.Assert(def.description == french,
                    $"{defName}.description reads '{def.description}' in a French game, expected the DefInjected text '{french}'");
            }
            else
            {
                ctx.Assert(def.description != french,
                    $"{defName}.description reads the French text '{french}' in the language '{active}'");
            }
        }

        private static string ReadInjected(PickleContext ctx, string file, string key)
        {
            ctx.Require(File.Exists(file), $"no DefInjected file at {file}");
            var element = XDocument.Load(file).Descendants(key).FirstOrDefault();
            ctx.Require(element != null, $"{file} has no <{key}> entry");
            return element.Value;
        }
    }
}
