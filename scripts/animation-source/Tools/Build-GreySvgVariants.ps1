$ErrorActionPreference = 'Stop'
$moduleRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $moduleRoot
$identityRoot = Join-Path $workspaceRoot 'oracle-identity-svg'
$circumstantialRoot = Join-Path $workspaceRoot 'oracle-circumstantial-svg'
$remainingRoot = Join-Path $workspaceRoot 'oracle-remaining-svg'

$variants = @{
    AS_BlindPassionGrey = Join-Path $identityRoot 'AS_BlindPassion.svg'
    AS_CompetitivePassionGrey = Join-Path $identityRoot 'AS_CompetitivePassion.svg'
    AS_DedicatedPassionGrey = Join-Path $remainingRoot 'AS_DedicatedPassion.svg'
    AS_DrunkenPassionGrey = Join-Path $remainingRoot 'AS_DrunkenPassion.svg'
    AS_DuncePassionGrey = Join-Path $remainingRoot 'AS_DuncePassion.svg'
    AS_ForbiddenPassionGrey = Join-Path $remainingRoot 'AS_ForbiddenPassion.svg'
    AS_FrozenPassionGrey = Join-Path $remainingRoot 'AS_FrozenPassion.svg'
    AS_IdeologicalPassionGrey = Join-Path $remainingRoot 'AS_IdeologicalPassion_Active.svg'
    AS_IntimatePassionGrey = Join-Path $remainingRoot 'AS_IntimatePassion_Active.svg'
    AS_LikeMindedPassionGrey = Join-Path $remainingRoot 'AS_LikeMindedPassion.svg'
    AS_MoodyPassionGrey = Join-Path $circumstantialRoot 'AS_MoodyPassion.svg'
    AS_NightPassionGrey = Join-Path $circumstantialRoot 'AS_NightPassion.svg'
    AS_NomadicPassionGrey = Join-Path $identityRoot 'AS_NomadicPassion.svg'
    AS_NudistPassionGrey = Join-Path $remainingRoot 'AS_NudistPassion_Active.svg'
    AS_ObsessivePassionGrey = Join-Path $remainingRoot 'AS_ObsessivePassion.svg'
    AS_PainDrivenPassionGrey = Join-Path $remainingRoot 'AS_PainDrivenPassion.svg'
    AS_PsychicPassionGrey = Join-Path $identityRoot 'AS_PsychicPassion.svg'
    AS_RainyDayPassionGrey = Join-Path $circumstantialRoot 'AS_RainyDayPassion.svg'
    AS_SanguinePassionGrey = Join-Path $remainingRoot 'AS_SanguinePassion.svg'
    AS_StonedPassionGrey = Join-Path $remainingRoot 'AS_StonedPassion.svg'
    AS_SynergisticPassionGrey = Join-Path $remainingRoot 'AS_SynergisticPassion.svg'
    AS_ToxicPassionGrey = Join-Path $identityRoot 'AS_ToxicPassion.svg'
    AS_TranshumanistPassionGrey = Join-Path $identityRoot 'AS_TranshumanistPassion_Active.svg'
    AS_TraumaticPassionGrey = Join-Path $remainingRoot 'AS_TraumaticPassion.svg'
    AS_VengefulPassionGrey = Join-Path $identityRoot 'AS_VengefulPassion.svg'
    AS_YouthPassionGrey = Join-Path $identityRoot 'AS_YouthPassion.svg'
}

foreach ($name in $variants.Keys) {
    $svg = Get-Content -Raw -LiteralPath $variants[$name]
    $svg = [regex]::Replace($svg, 'fill="#[0-9A-Fa-f]{6}"', 'fill="#939393"')
    [IO.File]::WriteAllText((Join-Path $remainingRoot ($name + '.svg')), $svg, [Text.UTF8Encoding]::new($false))
}

Write-Output "Generated $($variants.Count) grey SVG variants."
