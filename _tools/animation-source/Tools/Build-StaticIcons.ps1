param(
    [string]$ChromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)

$ErrorActionPreference = 'Stop'
$moduleRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $moduleRoot
$pngRoot = Join-Path $moduleRoot '1.6\Textures\Passions'
$profileRoot = Join-Path $moduleRoot ('.chrome-static-profile-' + [Guid]::NewGuid().ToString('N'))
$sourceRoots = @(
    (Join-Path $workspaceRoot 'oracle-circumstantial-svg'),
    (Join-Path $workspaceRoot 'oracle-identity-svg'),
    (Join-Path $workspaceRoot 'oracle-remaining-svg')
)

New-Item -ItemType Directory -Force -Path $pngRoot, $profileRoot | Out-Null

$sources = foreach ($root in $sourceRoots) {
    Get-ChildItem -LiteralPath $root -Filter '*.svg'
}

foreach ($source in $sources) {
    $pngPath = Join-Path $pngRoot ($source.BaseName + '.png')
    $frameProfile = Join-Path $profileRoot $source.BaseName
    New-Item -ItemType Directory -Force -Path $frameProfile | Out-Null
    $uri = [Uri]::new($source.FullName).AbsoluteUri
    $arguments = @('--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',"--user-data-dir=$frameProfile",'--default-background-color=00000000','--window-size=64,64',"--screenshot=$pngPath",$uri)
    Start-Process -FilePath $ChromePath -ArgumentList $arguments -Wait -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 50 -and -not (Test-Path -LiteralPath $pngPath); $attempt++) {
        Start-Sleep -Milliseconds 100
    }
    if (-not (Test-Path -LiteralPath $pngPath)) { throw "Chrome did not create $pngPath" }
}

Write-Output "Generated $($sources.Count) static icons."
