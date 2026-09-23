using RimWorld;
using Verse;

namespace SkillIcons;

// Standard MainButtonDef visibility is left to the game and to customization mods:
// buttonVisible=false in the Def hides it by default without removing it, so a tool such as
// RIMMSQOL can still reveal it. Activate() opens the same Dialog_ModSettings, for the same
// loaded mod instance, as the primary Options > Mod settings entry - never a second page.
public class MainButtonWorker_Settings : MainButtonWorker
{
    public override void Activate()
    {
        Find.WindowStack.Add(new Dialog_ModSettings(LoadedModManager.GetMod<SkillIconsMod>()));
    }
}
