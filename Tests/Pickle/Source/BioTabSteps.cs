using RimWorld;
using RimWorks.Pickle;
using Verse;

namespace SkillIcons.PickleSteps
{
    /// <summary>
    /// Opening the pawn's Character ("Bio") tab. Pickle's generic ui-steps.feature only opens
    /// MainTabWindow-level tabs by their MainButtonDef label ("I open the \"Research\" tab"); the
    /// Bio tab is not a main button at all, it is one of the always-present inspect pane's own
    /// ITabs, chosen through MainTabWindow_Inspect.openTabType - confirmed by reflection against
    /// the installed Assembly-CSharp.dll while writing this file: a Type field with exactly that
    /// name, read by MainTabWindow_Inspect.DoPaneContents to decide which ITab is drawn open. It
    /// is not public in Krafs.Rimworld.Ref's stub (the build itself proved that: a direct field
    /// access failed to compile against the reference assembly even though the real, installed
    /// Assembly-CSharp.dll does declare it), so it is reached by reflection instead, the same way
    /// ArchitectStudio's ModSteps.cs reaches Gizmo.disabled.
    /// </summary>
    [PickleSteps]
    public class BioTabSteps
    {
        [When("I open the Bio tab for {string}")]
        public void OpenBioTab(PickleContext ctx, string nickname)
        {
            var pawn = PassionSteps.Colonist(ctx, nickname);

            Find.Selector.ClearSelection();
            Find.Selector.Select(pawn);

            var window = MainButtonDefOf.Inspect.TabWindow as MainTabWindow_Inspect;
            ctx.Require(window != null,
                "MainButtonDefOf.Inspect.TabWindow is not a MainTabWindow_Inspect - update this step");
            if (!Find.WindowStack.IsOpen(window))
            {
                Find.WindowStack.Add(window);
            }

            var field = typeof(MainTabWindow_Inspect).GetField("openTabType", Driver.InstanceAny);
            ctx.Require(field != null, "MainTabWindow_Inspect.openTabType no longer exists: update this step");
            field.SetValue(window, typeof(ITab_Pawn_Character));
        }
    }
}
