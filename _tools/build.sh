#!/bin/bash
# Régénère les 85 textures statiques à partir des 41 dessins de gen.js, y compris
# les sept icônes vanilla/VSE : aucune texture du mod ne vient d'ailleurs.
# Remplace Build-StaticIcons.ps1 et Build-GreySvgVariants.ps1, dont les chemins
# source (oracle-*-svg) n'existent plus depuis la réorganisation.
#
# N'EFFACE RIEN dans 1.6/Textures/Passions, qui contient aussi Animated/.
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
shoot _tools/svg/Passions 1.6/Textures/Passions
shoot _tools/svg/Frames   1.6/Textures/Passions/Animated
shoot _tools/svg/UI       1.6/Textures/UI/Icons
shoot _tools/svg/Skills    1.6/Textures/Skills
shoot _tools/svg/WorkTypes 1.6/Textures/WorkTypes
shoot _tools/sil          _tools/silpng
echo "textures:$(ls 1.6/Textures/Passions/*.png | wc -l)  silhouettes:$(ls _tools/silpng | wc -l)  frames:$(ls 1.6/Textures/Passions/Animated | wc -l)"

# Le Preview fait 640x640 et non 64 : il ne peut pas passer par shoot().
# Il est rasterise en dernier, quand toutes les icones qu'il compose existent.
"$CH" --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=640,640 \
  --default-background-color=00000000 \
  --screenshot="$B/About/Preview.png" "file:///$B/_tools/svg/Preview.svg" >/dev/null 2>&1
echo "preview:$(ls -l About/Preview.png | awk '{print $5}') octets"
"$CH" --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=64,64 \
  --default-background-color=00000000 \
  --screenshot="$B/About/ModIcon.png" "file:///$B/_tools/svg/ModIcon.svg" >/dev/null 2>&1
