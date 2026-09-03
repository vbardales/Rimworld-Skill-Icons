# Mesure la teinte dominante de chaque icone couleur, directement dans le PNG.
# On verifie ainsi la regle nº1 du jeu d'icones (une teinte par passion) sur ce
# qui est reellement livre, pas sur ce que gen.js croit produire.
Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\nelim\Documents\rimworld\SkillIcons\1.6\Textures\Passions"
$res = @()
Get-ChildItem $dir -Filter *.png | Where-Object { $_.Name -notmatch 'Grey' } | ForEach-Object {
  $bmp = [System.Drawing.Bitmap]::FromFile($_.FullName)
  # Moyenne vectorielle des teintes, ponderee par alpha * saturation : les
  # pixels gris ou transparents ne doivent pas tirer la moyenne.
  $x = 0.0; $y = 0.0; $w = 0.0
  for ($i = 0; $i -lt $bmp.Width; $i += 2) {
    for ($j = 0; $j -lt $bmp.Height; $j += 2) {
      $c = $bmp.GetPixel($i, $j)
      if ($c.A -lt 40) { continue }
      $s = $c.GetSaturation(); $l = $c.GetBrightness()
      if ($s -lt 0.15 -or $l -lt 0.08 -or $l -gt 0.95) { continue }
      $p = ($c.A / 255.0) * $s
      $h = $c.GetHue() * [Math]::PI / 180.0
      $x += $p * [Math]::Cos($h); $y += $p * [Math]::Sin($h); $w += $p
    }
  }
  $bmp.Dispose()
  if ($w -lt 1) { $deg = -1 } else {
    $deg = [Math]::Round(([Math]::Atan2($y, $x) * 180.0 / [Math]::PI + 360) % 360)
  }
  $res += [pscustomobject]@{ Teinte = $deg; Icone = $_.BaseName }
}
$res | Sort-Object Teinte | Format-Table -AutoSize
$vals = ($res | Where-Object { $_.Teinte -ge 0 }).Teinte
"icones colorees : {0}" -f $vals.Count
"rouges (teinte < 30 ou > 330) : {0}" -f ($vals | Where-Object { $_ -lt 30 -or $_ -gt 330 }).Count
