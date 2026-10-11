#!/bin/bash
# Regenerates the 85 static textures from gen.js's 41 drawings, including the
# seven vanilla/VSE icons: no texture in this mod comes from anywhere else.
# Replaces Build-StaticIcons.ps1 and Build-GreySvgVariants.ps1, whose source
# paths (oracle-*-svg) no longer exist since the reorganisation.
#
# DELETES NOTHING under Mod/1.6/Textures/Passions, which also holds Animated/.
set -e
cd "$(dirname "$0")/.."
node scripts/gen.js
node scripts/preview.js
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
B="C:/Users/nelim/Documents/rimworld/SkillIcons"
shoot () {
  mkdir -p "$2"
  for f in "$1"/*.svg; do
    n=$(basename "$f" .svg)
    "$CH" --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=64,64 \
      --default-background-color=00000000 \
      --screenshot="$B/$2/$n.png" "file:///$B/$1/$n.svg" >/dev/null 2>&1
  done
}
shoot scripts/svg/Passions Mod/1.6/Textures/Passions
shoot scripts/svg/Frames   Mod/1.6/Textures/Passions/Animated
shoot scripts/svg/UI       Mod/1.6/Textures/UI/Icons
shoot scripts/sil          scripts/silpng
echo "textures:$(ls Mod/1.6/Textures/Passions/*.png | wc -l)  silhouettes:$(ls scripts/silpng | wc -l)  frames:$(ls Mod/1.6/Textures/Passions/Animated | wc -l)"

# The Preview background is 896x504, so it does not go through shoot(), which rasterises
# at 64x64. It is produced last, once every icon it composes exists: Art/Preview-source.png is
# text-free, and the shared scripts/Render-Preview.cjs (Art/Preview.config.json) engraves the
# title and writes Mod/About/Preview.png from it. Run it afterwards, from this folder:
#   node ../scripts/Render-Preview.cjs
#
# 896x504 is rendered NATIVELY, never obtained by cropping a square: centre-cropping removed 44%
# of the height, i.e. the whole row of icons.
mkdir -p Mod/About Art
"$CH" --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=896,504 --force-device-scale-factor=1 --default-background-color=00000000 --screenshot="$B/Art/Preview-source.png" "file:///$B/scripts/svg/PreviewSource.svg" >/dev/null 2>&1
echo "preview-source:$(ls -l Art/Preview-source.png | awk '{print $5}') octets"
# The mascot icon in Mod/About/ModIcon.png is NOT generated: it is drawn to the
# repository's house style, and it is the only file of a mod that claims to say
# "this is the mod". This pass used to rasterise scripts/svg/ModIcon.svg over it,
# which would have silently replaced the mascot with the old four-hearts square
# on the next full run. Nothing here writes About/ any more.
