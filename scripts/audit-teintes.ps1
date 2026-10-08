# Measures the dominant hue of every colour icon, directly from the PNG.
# This checks icon set rule 1 (one hue per passion) against what actually
# ships, not against what gen.js believes it produces.
Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\nelim\Documents\rimworld\SkillIcons\Mod\1.6\Textures\Passions"
$res = @()
Get-ChildItem $dir -Filter *.png | Where-Object { $_.Name -notmatch 'Grey' } | ForEach-Object {
  $bmp = [System.Drawing.Bitmap]::FromFile($_.FullName)
  # Vector average of hues, weighted by alpha * saturation: grey or
  # transparent pixels must not pull the average.
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
"coloured icons: {0}" -f $vals.Count
"reds (hue < 30 or > 330): {0}" -f ($vals | Where-Object { $_ -lt 30 -or $_ -gt 330 }).Count
