param(
    [string]$ChromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)

$ErrorActionPreference = 'Stop'
[Threading.Thread]::CurrentThread.CurrentCulture = [Globalization.CultureInfo]::InvariantCulture
$moduleRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $moduleRoot
$identityRoot = Join-Path $workspaceRoot 'oracle-identity-svg'
$circumstantialRoot = Join-Path $workspaceRoot 'oracle-circumstantial-svg'
$frameSvgRoot = Join-Path $moduleRoot 'SourceFrames'
$pngRoot = Join-Path $moduleRoot '1.6\Textures\Passions\Animated'
$profileRoot = Join-Path $moduleRoot ('.chrome-profile-' + [Guid]::NewGuid().ToString('N'))

New-Item -ItemType Directory -Force -Path $frameSvgRoot, $pngRoot, $profileRoot | Out-Null
Get-ChildItem -LiteralPath $frameSvgRoot -Filter '*.svg' -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -LiteralPath $pngRoot -Filter '*.png' -ErrorAction SilentlyContinue | Remove-Item -Force

$animations = @(
    @{ Key='AS_MoodyPassion'; Source=(Join-Path $circumstantialRoot 'AS_MoodyPassion.svg'); Count=4; Mode='pulse' },
    @{ Key='AS_MoodyPassion_Major'; Source=(Join-Path $circumstantialRoot 'AS_MoodyPassion_Major.svg'); Count=4; Mode='pulse' },
    @{ Key='AS_MoodyPassion_Greater'; Source=(Join-Path $circumstantialRoot 'AS_MoodyPassion_Greater.svg'); Count=6; Mode='pulse' },
    @{ Key='AS_NightPassion'; Source=(Join-Path $circumstantialRoot 'AS_NightPassion.svg'); Count=4; Mode='twinkle' },
    @{ Key='AS_RainyDayPassion'; Source=(Join-Path $circumstantialRoot 'AS_RainyDayPassion.svg'); Count=6; Mode='rain' },
    @{ Key='AS_PsychicPassion'; Source=(Join-Path $identityRoot 'AS_PsychicPassion.svg'); Count=4; Mode='pulse' },
    @{ Key='AS_PsychicPassion_Major'; Source=(Join-Path $identityRoot 'AS_PsychicPassion_Major.svg'); Count=6; Mode='pulse' },
    @{ Key='AS_PsychicPassion_Critical'; Source=(Join-Path $identityRoot 'AS_PsychicPassion_Critical.svg'); Count=6; Mode='pulse' },
    @{ Key='AS_CompetitivePassion'; Source=(Join-Path $identityRoot 'AS_CompetitivePassion.svg'); Count=6; Mode='lift' },
    @{ Key='AS_BlindPassion_Active'; Source=(Join-Path $identityRoot 'AS_BlindPassion_Active.svg'); Count=4; Mode='pulse' },
    @{ Key='AS_TranshumanistPassion_Active'; Source=(Join-Path $identityRoot 'AS_TranshumanistPassion_Active.svg'); Count=4; Mode='pulse' },
    @{ Key='AS_YouthPassion'; Source=(Join-Path $identityRoot 'AS_YouthPassion.svg'); Count=4; Mode='sway' },
    @{ Key='AS_VengefulPassion'; Source=(Join-Path $identityRoot 'AS_VengefulPassion.svg'); Count=4; Mode='jolt' },
    @{ Key='AS_NomadicPassion'; Source=(Join-Path $identityRoot 'AS_NomadicPassion.svg'); Count=8; Mode='rotate' },
    @{ Key='AS_ToxicPassion'; Source=(Join-Path $identityRoot 'AS_ToxicPassion.svg'); Count=6; Mode='float' },
    @{ Key='AS_DrunkenPassion'; Source=(Join-Path $workspaceRoot 'oracle-remaining-svg\AS_DrunkenPassion.svg'); Count=6; Mode='champagne' },
    @{ Key='AS_StonedPassion'; Source=(Join-Path $workspaceRoot 'oracle-remaining-svg\AS_StonedPassion.svg'); Count=6; Mode='sway' },
    @{ Key='AS_SanguinePassion'; Source=(Join-Path $workspaceRoot 'oracle-remaining-svg\AS_SanguinePassion.svg'); Count=6; Mode='pulse' },
    @{ Key='AS_PainDrivenPassion'; Source=(Join-Path $workspaceRoot 'oracle-remaining-svg\AS_PainDrivenPassion.svg'); Count=4; Mode='jolt' },
    @{ Key='AS_IdeologicalPassion_Active'; Source=(Join-Path $workspaceRoot 'oracle-remaining-svg\AS_IdeologicalPassion_Active.svg'); Count=6; Mode='pulse' },
    @{ Key='AS_IntimatePassion_Active'; Source=(Join-Path $workspaceRoot 'oracle-remaining-svg\AS_IntimatePassion_Active.svg'); Count=6; Mode='pulse' },
    @{ Key='AS_NudistPassion_Active'; Source=(Join-Path $workspaceRoot 'oracle-remaining-svg\AS_NudistPassion_Active.svg'); Count=4; Mode='pulse' }
)

function Get-Transform([string]$mode, [int]$index, [int]$count) {
    $phase = 2 * [Math]::PI * $index / $count
    switch ($mode) {
        'pulse' {
            $scale = 0.975 + 0.025 * [Math]::Sin($phase)
            return ('translate(32 32) scale({0:F4}) translate(-32 -32)' -f $scale)
        }
        'rain' {
            $offset = 0.8 * [Math]::Sin($phase)
            return ('translate(0 {0:F3})' -f $offset)
        }
        'lift' {
            $offset = -1.2 * [Math]::Max(0, [Math]::Sin($phase))
            return ('translate(0 {0:F3})' -f $offset)
        }
        'sway' {
            $angle = 2.0 * [Math]::Sin($phase)
            return ('rotate({0:F3} 32 51)' -f $angle)
        }
        'jolt' {
            $angle = 1.5 * [Math]::Sin($phase)
            return ('rotate({0:F3} 32 32)' -f $angle)
        }
        'rotate' {
            $angle = 4.0 * [Math]::Sin($phase)
            return ('rotate({0:F3} 32 32)' -f $angle)
        }
        'float' {
            $offset = -0.8 * [Math]::Sin($phase)
            return ('translate(0 {0:F3})' -f $offset)
        }
        default { return '' }
    }
}

function Get-ChampagneBubbles([int]$index) {
    $sets = @(
        '<g id="bubbles" fill="#FFF0B0"><circle cx="26" cy="29" r="2.2"/><circle cx="35" cy="26" r="1.8"/><circle cx="30" cy="21" r="1.5"/><circle cx="39" cy="18" r="1.3"/><circle cx="24" cy="15" r="1.1"/></g>',
        '<g id="bubbles" fill="#FFF0B0"><circle cx="26" cy="27" r="2.2"/><circle cx="35" cy="24" r="1.8"/><circle cx="30" cy="19" r="1.5"/><circle cx="39" cy="16" r="1.3"/><circle cx="25" cy="13" r="0.8"/></g>',
        '<g id="bubbles" fill="#FFF0B0"><circle cx="26" cy="25" r="2.0"/><circle cx="35" cy="22" r="1.8"/><circle cx="30" cy="17" r="1.5"/><circle cx="40" cy="14" r="1.0"/><circle cx="24" cy="29" r="1.1"/></g>',
        '<g id="bubbles" fill="#FFF0B0"><circle cx="26" cy="23" r="2.0"/><circle cx="35" cy="20" r="1.7"/><circle cx="30" cy="15" r="1.4"/><circle cx="39" cy="28" r="1.2"/><circle cx="24" cy="27" r="1.1"/></g>',
        '<g id="bubbles" fill="#FFF0B0"><circle cx="26" cy="21" r="1.9"/><circle cx="35" cy="18" r="1.6"/><circle cx="30" cy="28" r="1.5"/><circle cx="39" cy="26" r="1.2"/><circle cx="24" cy="25" r="1.0"/></g>',
        '<g id="bubbles" fill="#FFF0B0"><circle cx="26" cy="19" r="1.8"/><circle cx="35" cy="16" r="1.4"/><circle cx="30" cy="26" r="1.5"/><circle cx="39" cy="24" r="1.2"/><circle cx="24" cy="23" r="1.0"/></g>'
    )
    return $sets[$index % $sets.Count]
}

foreach ($animation in $animations) {
    $source = Get-Content -Raw -LiteralPath $animation.Source
    $inner = $source -replace '(?s)^\s*<svg[^>]*>\s*', '' -replace '(?s)\s*</svg>\s*$', ''
    for ($index = 0; $index -lt $animation.Count; $index++) {
        $frameInner = $inner
        if ($animation.Mode -eq 'champagne') {
            $frameInner = $frameInner -replace '(?s)<g id="bubbles".*?</g>', (Get-ChampagneBubbles $index)
        }
        if ($animation.Mode -eq 'twinkle') {
            $starScales = @(0.72, 1.0, 1.28, 1.0)
            $starTransform = 'translate(47 18) scale(' + $starScales[$index % 4].ToString('0.00', [Globalization.CultureInfo]::InvariantCulture) + ') translate(-47 -18)'
            $frameInner = $frameInner -replace '<g id="star" ', ('<g id="star" transform="' + $starTransform + '" ')
        }
        $suffix = $index.ToString('00')
        $transform = Get-Transform $animation.Mode $index $animation.Count
        $frameSvg = "<svg xmlns=`"http://www.w3.org/2000/svg`" viewBox=`"0 0 64 64`" width=`"64`" height=`"64`">`n  <g transform=`"$transform`">`n$frameInner`n  </g>`n</svg>`n"
        $svgPath = Join-Path $frameSvgRoot ($animation.Key + '_' + $suffix + '.svg')
        $pngPath = Join-Path $pngRoot ($animation.Key + '_' + $suffix + '.png')
        [IO.File]::WriteAllText($svgPath, $frameSvg, [Text.UTF8Encoding]::new($false))
        $uri = [Uri]::new($svgPath).AbsoluteUri
        $frameProfile = Join-Path $profileRoot ($animation.Key + '_' + $suffix)
        New-Item -ItemType Directory -Force -Path $frameProfile | Out-Null
        $arguments = @('--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',"--user-data-dir=$frameProfile",'--default-background-color=00000000','--window-size=64,64',"--screenshot=$pngPath",$uri)
        Start-Process -FilePath $ChromePath -ArgumentList $arguments -Wait -WindowStyle Hidden
        for ($attempt = 0; $attempt -lt 30 -and -not (Test-Path -LiteralPath $pngPath); $attempt++) {
            Start-Sleep -Milliseconds 100
        }
        if (-not (Test-Path -LiteralPath $pngPath)) { throw "Chrome did not create $pngPath" }
    }
}

Write-Output "Generated $((Get-ChildItem -LiteralPath $pngRoot -Filter '*.png').Count) animation frames."
