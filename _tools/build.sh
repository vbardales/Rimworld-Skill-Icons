#!/bin/bash
# Regenerates the 85 static textures from gen.js's 41 drawings, including the
# seven vanilla/VSE icons: no texture in this mod comes from anywhere else.
# Replaces Build-StaticIcons.ps1 and Build-GreySvgVariants.ps1, whose source
# paths (oracle-*-svg) no longer exist since the reorganisation.
#
# DELETES NOTHING under Mod/1.6/Textures/Passions, which also holds Animated/.
set -e
cd "$(dirname "$0")/.."
node _tools/gen.js
node _tools/preview.js
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
shoot _tools/svg/Passions Mod/1.6/Textures/Passions
shoot _tools/svg/Frames   Mod/1.6/Textures/Passions/Animated
shoot _tools/svg/UI       Mod/1.6/Textures/UI/Icons
shoot _tools/svg/Skills    Mod/1.6/Textures/Skills
shoot _tools/svg/WorkTypes Mod/1.6/Textures/WorkTypes
shoot _tools/sil          _tools/silpng
echo "textures:$(ls Mod/1.6/Textures/Passions/*.png | wc -l)  silhouettes:$(ls _tools/silpng | wc -l)  frames:$(ls Mod/1.6/Textures/Passions/Animated | wc -l)"

# The Preview is 896x504, so it does not go through shoot(), which rasterises
# at 64x64. It is produced last, once every icon it composes exists. TWO
# outputs: About/Preview.png carries the title, Art/Preview-source.png does
# not - that is the one the repository's uniform overlay process engraves,
# and a title already present there would duplicate it.
#
# 896x504 is rendered NATIVELY, never obtained by cropping a square: centre-
# cropping a 640x640 source removed 44% of its height, i.e. the whole row of
# skill and work type icons, leaving only the caption - which announced icons
# that were no longer there.
mkdir -p Mod/About Art
"$CH" --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=896,504 --force-device-scale-factor=1 --default-background-color=00000000 --screenshot="$B/Mod/About/Preview.png" "file:///$B/_tools/svg/Preview.svg" >/dev/null 2>&1
"$CH" --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=896,504 --force-device-scale-factor=1 --default-background-color=00000000 --screenshot="$B/Art/Preview-source.png" "file:///$B/_tools/svg/PreviewSource.svg" >/dev/null 2>&1
echo "preview:$(ls -l Mod/About/Preview.png | awk '{print $5}') octets"
# The mascot icon in Mod/About/ModIcon.png is NOT generated: it is drawn to the
# repository's house style, and it is the only file of a mod that claims to say
# "this is the mod". This pass used to rasterise _tools/svg/ModIcon.svg over it,
# which would have silently replaced the mascot with the old four-hearts square
# on the next full run. The SVG is still written, so the fallback is one Chrome
# command away, but nothing here overwrites About/ any more.
