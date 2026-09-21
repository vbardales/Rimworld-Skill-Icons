using System.Collections.Generic;
using System.Linq;
using RimWorks.Pickle;
using Verse;

namespace SkillIcons.PickleSteps
{
    /// <summary>
    /// The one failure mode of this mod that every other check would miss.
    ///
    /// Oracle's Skill Icon Retextures writes to the SAME texture paths as this mod. RimWorld
    /// resolves a texture path by walking the running mods and letting the last one win, which is
    /// why About.xml names Oracle in loadAfter. If that ordering ever stopped winning - a renamed
    /// packageId upstream, a load order a player rearranged, a loadAfter entry lost in an edit -
    /// nothing in this suite would go red. The icons would still be present, still animated, still
    /// the right shape in the right places. They would simply be Oracle's.
    ///
    /// So this asserts the thing the silence hides: WHICH mod answers for a path. It does not
    /// compare pixels, which would need readable textures and would only say "different", not
    /// "whose". It asks RimWorld's own content holders, the same ones ContentFinder searches.
    ///
    /// Only meaningful in the pass that stages Oracle - wsl-deps.avec-oracle.map. In the minimal
    /// pass this mod is the only candidate and the assertion passes trivially, which is correct:
    /// the claim is "we win when contested", and uncontested is not a contest.
    /// </summary>
    [PickleSteps]
    public class TextureOwnerSteps
    {
        /// <summary>
        /// Every running mod that ships this texture path, in load order. ContentFinder resolves
        /// to the LAST of them, so the winner is the tail, and a list of one means nothing is
        /// contesting the path at all.
        /// </summary>
        private static List<ModContentPack> Providers(PickleContext ctx, string path)
        {
            var providers = LoadedModManager.RunningMods
                .Where(m => m.GetContentHolder<UnityEngine.Texture2D>().Get(path) != null)
                .ToList();
            ctx.Require(providers.Count > 0,
                $"no running mod ships the texture '{path}' at all - the path is wrong, or this mod's textures are not being loaded");
            return providers;
        }

        [Then("SkillIcons owns the texture {string}")]
        public void OwnsTexture(PickleContext ctx, string path)
        {
            var providers = Providers(ctx, path);
            var winner = providers.Last();
            ctx.Assert(winner.PackageId.ToLowerInvariant() == "nelim.skillicons",
                $"'{path}' resolves to '{winner.Name}' ({winner.PackageId}), not to SkillIcons. "
                + $"Mods shipping it, in load order: {string.Join(" -> ", providers.Select(m => m.PackageId))}. "
                + "The loadAfter in About.xml is no longer winning, and every icon a player sees for this passion is that mod's.");
        }

        [Then("the texture {string} is contested by at least {int} mods")]
        public void IsContested(PickleContext ctx, string path, int count)
        {
            var providers = Providers(ctx, path);
            ctx.Assert(providers.Count >= count,
                $"'{path}' is shipped by {providers.Count} running mod(s) ({string.Join(", ", providers.Select(m => m.PackageId))}), "
                + $"expected at least {count}. In the pass that stages a competing icon set, an uncontested path means the "
                + "competitor is not actually loaded, so the scenario that follows would prove nothing.");
        }
    }
}
