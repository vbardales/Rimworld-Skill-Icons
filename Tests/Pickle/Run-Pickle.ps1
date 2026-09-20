<#
    Runs this mod's Pickle suite, under a lock no second session can take.

    One machine has one RimWorld, and Pickle has one runner inside it. Two sessions starting a run
    at the same time is the failure this exists for: the second launch dies on Steam's single
    instance, and a second /run lands on a runner that is already busy. Both leave the report
    unwritten, which is how an afternoon gets spent reading a report from hours earlier.

    Without -Launch the script drives the game that is already open, through Pickle's dashboard:
    the step assembly is read at startup, so this only tests a build older than that game. With
    -Launch it starts one, which is what a freshly built step assembly needs.

    The game is never closed by this script. An unattended run closes it by itself when it ends;
    a game that was already open stays open.

    Before a run starts, the report of the previous one is moved to PickleReports-archive, under
    the hour it was written, and the oldest are dropped past -KeepReports. Pickle writes every run
    into the one folder and overwrites it, screenshots included: without this, starting a run
    destroys the evidence of the one before. An archive is a reprieve, not storage - a session
    that needs a report copies what it needs somewhere of its own.

    Two things specific to this suite. The assistant never passes -Launch: starting RimWorld is
    Virginie's, and this script's no-Launch path is the whole reason it can drive a run at all.
    And scenario 10 only proves anything with aitranslation.pack and seohyeon.autotranslation
    disabled - their interceptor can supply text for our own keys and turn the French check green
    over translations that do not exist.
#>
[CmdletBinding()]
param(
    [string]$Mod = 'SkillIcons - Pickle tests',
    [int]$Port = 27750,
    [switch]$Launch,
    [int]$TimeoutMinutes = 90,
    [int]$KeepReports = 5,
    [switch]$Force
)


# -Launch is refused since 2026-09-21. Starting the Windows game takes her screen, and on
# 2026-09-20 three sessions did it without her asking. A suite runs in the WSL install now:
#   pwsh -File scripts/Run-PickleWsl.ps1 -Mod <Mod>
# What remains here is driving a game SHE already has open, through Pickle's dashboard.
if ($Launch) {
    Write-Host 'Lancer le RimWorld de Windows est interdit : il prend son ecran.' -ForegroundColor Red
    Write-Host 'Utilise  pwsh -File scripts/Run-PickleWsl.ps1 -Mod <Mod>  (WSL, sous Xvfb).' -ForegroundColor Yellow
    exit 5
}

$ErrorActionPreference = 'Stop'

$lockPath = Join-Path $env:LOCALAPPDATA 'rimworld-pickle-run.lock'
$gamePath = 'C:\Program Files (x86)\Steam\steamapps\common\RimWorld\RimWorldWin64.exe'
$reportRoot = Join-Path $env:USERPROFILE 'AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\PickleReports'
$archiveRoot = "$reportRoot-archive"
$origin = "http://localhost:$Port"

function Test-GameRunning {
    return $null -ne (Get-Process -Name RimWorldWin64 -ErrorAction SilentlyContinue)
}

function Get-RunnerState {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "$origin/state" -TimeoutSec 10
    return $response.Content | ConvertFrom-Json
}

function Invoke-Runner($path) {
    Invoke-RestMethod -Method Post -Uri "$origin$path" -Headers @{ Origin = $origin } -TimeoutSec 30 | Out-Null
}

# CreateNew is the whole point: the file system decides who gets the lock, not a Test-Path that
# another session can win between the test and the write.
function Enter-Lock {
    for ($attempt = 0; $attempt -lt 2; $attempt++) {
        try {
            $stream = [System.IO.File]::Open($lockPath, 'CreateNew', 'Write', 'None')
            $holder = @{ pid = $PID; host = $env:COMPUTERNAME; taken = (Get-Date).ToString('o'); mod = $Mod } | ConvertTo-Json -Compress
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($holder)
            $stream.Write($bytes, 0, $bytes.Length)
            $stream.Close()
            return
        } catch [System.IO.IOException] {
            $held = $null
            try { $held = Get-Content $lockPath -Raw -ErrorAction Stop | ConvertFrom-Json } catch { }
            $alive = $false
            if ($held) { $alive = $null -ne (Get-Process -Id $held.pid -ErrorAction SilentlyContinue) }
            if ($alive -and -not $Force) {
                throw "A Pickle run is already held by process $($held.pid), taken at $($held.taken) for '$($held.mod)'. Wait for it, or pass -Force once you know that run is over."
            }
            if ($held) { Write-Host "Taking the lock from process $($held.pid), which is gone (taken at $($held.taken))." }
            Remove-Item $lockPath -Force
        }
    }
    throw "Could not take $lockPath."
}

function Exit-Lock {
    Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
}

# Pickle writes every run into one folder and overwrites what was there, screenshots included. The
# run that is about to start would therefore destroy the evidence of the one before it - which is
# how a failure spends an afternoon being read from a report that belonged to another run. Moving
# the old one out costs nothing on the same volume, and leaves the live folder empty rather than
# growing without end.
#
# This keeps the last $KeepReports runs by count, not by age: a day with six runs would otherwise
# lose the one that mattered, and a quiet week would keep nothing but stale ones.
#
# An archive is not storage. A session that needs a report must copy what it needs somewhere of
# its own, and clean up after itself: the runs that follow will push this one out.
function Save-PreviousReport {
    $marker = Join-Path $reportRoot 'junit.xml'
    if (-not (Test-Path $marker)) { return }

    $stamp = (Get-Item $marker).LastWriteTime.ToString('yyyy-MM-dd_HHmm')
    $target = Join-Path $archiveRoot $stamp
    $twin = 1
    while (Test-Path $target) {
        $twin++
        $target = Join-Path $archiveRoot "$stamp-$twin"
    }
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    Get-ChildItem -LiteralPath $reportRoot | Move-Item -Destination $target

    # The report names its screenshots by absolute path, into the folder the next run is about to
    # fill: left as they are, an archived report would show the wrong images, which is worse than
    # showing none.
    # Pickle writes those paths with mixed separators - forward slashes down to the save folder,
    # backslashes after it - so they are matched separator by separator rather than literally.
    $anySeparator = ($reportRoot -split '[\\/]' | ForEach-Object { [regex]::Escape($_) }) -join '[\\/]'
    $utf8 = New-Object System.Text.UTF8Encoding $false
    foreach ($file in (Get-ChildItem -LiteralPath $target -File | Where-Object { $_.Extension -in '.xml', '.html', '.md', '.json', '.ndjson' })) {
        $text = [System.IO.File]::ReadAllText($file.FullName)
        $rewritten = [regex]::Replace($text, $anySeparator, '.', 'IgnoreCase')
        if ($rewritten -ne $text) { [System.IO.File]::WriteAllText($file.FullName, $rewritten, $utf8) }
    }
    Write-Host "Previous report kept in $target."

    $stale = @(Get-ChildItem -LiteralPath $archiveRoot -Directory | Sort-Object LastWriteTime -Descending | Select-Object -Skip $KeepReports)
    foreach ($directory in $stale) {
        Remove-Item -LiteralPath $directory.FullName -Recurse -Force
        Write-Host "Dropped $($directory.Name): older than the last $KeepReports runs."
    }
}

function Show-Outcome {
    $state = Get-RunnerState
    $scenarios = @($state.features | Where-Object { $_.mod -eq $Mod } | ForEach-Object { $_.scenarios })
    $passed = @($scenarios | Where-Object { $_.outcome -eq 'Passed' }).Count
    $failed = @($scenarios | Where-Object { $_.outcome -eq 'Failed' })
    $skipped = @($scenarios | Where-Object { $_.outcome -eq 'Skipped' }).Count

    Write-Host ""
    Write-Host "$Mod : $passed passed, $($failed.Count) failed, $skipped skipped"
    foreach ($scenario in $failed) {
        Write-Host ""
        Write-Host "FAILED: $($scenario.name)"
        Write-Host "  $($scenario.failureMessage)"
        foreach ($attachment in $scenario.attachments) {
            if ($attachment.name -eq 'smoke-attachment') { continue }
            Write-Host "  [$($attachment.name)] $($attachment.content)"
        }
    }
    Write-Host ""
    Write-Host "Report: $reportRoot"
    if ($failed.Count -gt 0) { exit 1 }
}

Enter-Lock
try {
    if ($Launch) {
        if (Test-GameRunning) {
            throw 'RimWorld is already running. Drive it without -Launch, or let whoever is playing finish: this script never closes the game.'
        }
        # The filter is the companion mod's name, exactly; PowerShell would otherwise cut the
        # argument at the first space and Pickle would find no scenario at all.
        $arguments = "-pickle-run=`"$Mod`""
        Save-PreviousReport
        Write-Host "Launching RimWorld for '$Mod'..."
        $game = Start-Process -FilePath $gamePath -ArgumentList $arguments -PassThru
        $deadline = (Get-Date).AddMinutes($TimeoutMinutes)
        while (-not $game.HasExited) {
            if ((Get-Date) -gt $deadline) { throw "The run is still going after $TimeoutMinutes minutes; the game is left alone, check it yourself." }
            Start-Sleep -Seconds 15
        }
        $junit = Join-Path $reportRoot 'junit.xml'
        if (-not (Test-Path $junit)) { throw "The game exited without writing ${junit}: the run never reached its end." }
        Write-Host "Report written: $junit"
        return
    }

    if (-not (Test-GameRunning)) {
        throw 'No RimWorld is running. Start one with -Launch, which is also what a step assembly built since that game started needs.'
    }
    # A game started for an unattended run closes itself the moment that run ends, and the lock is
    # rendered a little before the process is actually gone. Driving that game means riding into
    # its shutdown: the scenarios run, the screenshots land, and the report is never written. This
    # is a precaution rather than the cure for 2026-09-20 - that run died because a second RimWorld
    # was started - but the window is real and the command line closes it for nothing.
    $commandLine = (Get-CimInstance Win32_Process -Filter "Name = 'RimWorldWin64.exe'" | Select-Object -First 1).CommandLine
    if ($commandLine -match '-pickle-run=') {
        throw "That RimWorld was started for an unattended run and closes itself when that run ends; driving it loses the report. Wait for it to finish, then open a game by hand, or run this with -Launch once nothing is running."
    }


    $state = Get-RunnerState
    if ($state.status -ne 'idle') {
        throw "The runner is $($state.status) on '$($state.scenario)'. Someone else is driving this game."
    }

    # The search box is remembered between runs, and a scenario it hides is a scenario the
    # selection below silently misses.
    Invoke-Runner '/filter?search=&mod=&clearTags=true'
    Invoke-Runner '/select?scope=none'
    Invoke-Runner ('/select?on=true&mod=' + [uri]::EscapeDataString($Mod))

    $state = Get-RunnerState
    $selected = @($state.features | ForEach-Object { $_.scenarios } | Where-Object { $_.selected }).Count
    if ($selected -eq 0) { throw "Nothing matched '$Mod': check the mod name against the runner's own list." }
    Write-Host "Running $selected scenarios of '$Mod'. The pointer moves on its own: leave the mouse alone."
    Save-PreviousReport

    Invoke-Runner '/scope?value=selected'
    Invoke-Runner '/run?scope=selected'

    $deadline = (Get-Date).AddMinutes($TimeoutMinutes)
    do {
        Start-Sleep -Seconds 15
        if ((Get-Date) -gt $deadline) { throw "The run is still going after $TimeoutMinutes minutes. It is left running; abort it from the dashboard at $origin/." }
        $state = Get-RunnerState
    } while ($state.status -eq 'running')

    Show-Outcome
} finally {
    Exit-Lock
}
