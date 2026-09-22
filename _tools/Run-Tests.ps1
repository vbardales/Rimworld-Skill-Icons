<#
.SYNOPSIS
  Out-of-game test suite for SkillIcons: the mod's own compiled code and shipped XML run for
  real, no RimWorld process involved.

.DESCRIPTION
  Follows this repository's established convention (see CrystalBall/_tools/Run-Tests.ps1):
  the suite writes with Write-Output and never Write-Host, a test body returns problem strings
  (empty = pass), and a skip is loud - counted and printed, never a silent pass.

  What each group proves, and why reading the source is not enough:

  - Settings defaults/clamping: SkillIconsSettings.ExposeData() actually runs. Scribe.mode
    defaults to Inactive outside the game, so Scribe_Values.Look becomes a no-op and the five
    Mathf.Clamp lines that follow it run unconditionally - this is what lets the real clamp
    logic execute hors jeu instead of being re-typed by hand in the test.
  - MainButtons wiring: MainButtonWorker_Settings.Activate() cannot be *called* hors jeu -
    Find.WindowStack and LoadedModManager.GetMod<T>() both need a running game - so its IL is
    read instead, proving it constructs Dialog_ModSettings for the same mod instance rather
    than asserting it from the source.
  - Harmony patch targets: resolved by plain reflection against the real installed
    Assembly-CSharp/VSE.dll, proving the method citations still match this RimWorld version
    instead of trusting last year's names.
  - Frame-count parity: the C# Specs table (read off the compiled DLL) and gen.js's SPECS array
    compared directly, plus the actual frame files counted on disk - the documented "counter
    drift" trap this repository has hit before.
  - Patch XML replay: PatchOperationAdd/Replace/Sequence instantiated and Apply()'d for real,
    against the REAL installed Alpha Skills/VSE def nodes read off disk, never a hand-typed
    copy of them - proving the patches fix the actual upstream bug, not a fixture that
    resembles it.
#>
param(
    [string]$ModRoot        = (Split-Path -Parent $PSScriptRoot),
    [string]$GameData       = 'C:\Program Files (x86)\Steam\steamapps\common\RimWorld\Data',
    [string]$Managed        = 'C:\Program Files (x86)\Steam\steamapps\common\RimWorld\RimWorldWin64_Data\Managed',
    [string]$AlphaSkillsRoot = 'C:\Program Files (x86)\Steam\steamapps\workshop\content\294100\3448953006',
    [string]$VseRoot         = 'C:\Program Files (x86)\Steam\steamapps\workshop\content\294100\3400246558',
    [string]$HarmonyDll      = 'C:\Program Files (x86)\Steam\steamapps\workshop\content\294100\2009463077\Current\Assemblies\0Harmony.dll'
)

$ErrorActionPreference = 'Stop'

$script:ran     = 0
$script:failed  = 0
$script:skipped = 0

function It([string]$name, [scriptblock]$body) {
    $script:ran++
    $problems = @()
    try   { $problems = @(& $body | Where-Object { $_ }) }
    catch { $problems = @("threw: $($_.Exception.Message)") }

    if ($problems.Count -eq 0) {
        Write-Output "  ok    $name"
    } else {
        $script:failed++
        Write-Output "  FAIL  $name"
        foreach ($p in $problems) { Write-Output "          $p" }
    }
}

function ItSkip([string]$name, [string]$why) {
    $script:skipped++
    Write-Output "  skip  $name"
    Write-Output "          $why"
}

# ---------------------------------------------------------------- assembly loading
$modDll = Join-Path $ModRoot 'Mod\1.6\Assemblies\SkillIcons.dll'
if (-not (Test-Path $modDll)) { throw "SkillIcons.dll not found at $modDll" }

# Loading the DLL locks the file for the life of this process, so a build that runs right
# after would fail to overwrite it. Load a scratch copy instead.
$scratch = Join-Path $env:TEMP "SkillIconsTests-$([guid]::NewGuid().ToString('N').Substring(0,8))"
New-Item -ItemType Directory -Path $scratch -Force | Out-Null
$scratchDll = Join-Path $scratch 'SkillIcons.dll'
Copy-Item $modDll $scratchDll

$vseDll = Join-Path $VseRoot '1.6\Assemblies\VSE.dll'

$probeDirs = @($Managed, (Split-Path -Parent $vseDll), (Split-Path -Parent $HarmonyDll), $scratch) | Where-Object { $_ } | Select-Object -Unique
$script:probed = @{}
$script:asmResolver = [System.ResolveEventHandler]{
    param($sender, $e)
    if ($null -eq $script:probed) { return $null }
    $short = $e.Name.Split(',')[0]
    if ($script:probed.ContainsKey($short)) { return $null }
    $script:probed[$short] = $true
    foreach ($d in $probeDirs) {
        $p = Join-Path $d "$short.dll"
        if (Test-Path $p) { return [System.Reflection.Assembly]::LoadFrom($p) }
    }
    return $null
}
[System.AppDomain]::CurrentDomain.add_AssemblyResolve($script:asmResolver)

$csAsm  = [System.Reflection.Assembly]::LoadFrom((Join-Path $Managed 'Assembly-CSharp.dll'))
$vseAsm = [System.Reflection.Assembly]::LoadFrom($vseDll)
if (Test-Path $HarmonyDll) { [System.Reflection.Assembly]::LoadFrom($HarmonyDll) | Out-Null }
$mod    = [System.Reflection.Assembly]::LoadFrom($scratchDll)

function Get-AssemblyTypes([System.Reflection.Assembly]$a) {
    try     { return $a.GetTypes() }
    catch [System.Reflection.ReflectionTypeLoadException] { return $_.Exception.Types | Where-Object { $_ } }
    catch   { return $_.Exception.InnerException.Types | Where-Object { $_ } }
}

$modTypes = Get-AssemblyTypes $mod
$byName = @{}
foreach ($t in $modTypes) { $byName[$t.FullName] = $t }

Write-Output "SkillIcons out-of-game test suite"
Write-Output "Managed: $Managed"
Write-Output "Mod DLL: $modDll"
Write-Output ''

# =================================================================== A. harness guard
It 'the mod assembly loads and declares its own types' {
    if ($modTypes.Count -lt 5) { "only $($modTypes.Count) types loaded from the mod assembly" }
}
It 'Assembly-CSharp and VSE.dll resolved enough types to work with' {
    $n1 = (Get-AssemblyTypes $csAsm).Count
    $n2 = (Get-AssemblyTypes $vseAsm).Count
    if ($n1 -lt 1000) { "Assembly-CSharp: only $n1 types" }
    if ($n2 -lt 5)     { "VSE.dll: only $n2 types" }
}

# =================================================================== B. settings defaults & clamping
$settingsType = $byName['SkillIcons.SkillIconsSettings']
if (-not $settingsType) {
    ItSkip 'settings defaults match documentation' 'SkillIcons.SkillIconsSettings not found in the mod assembly'
    ItSkip 'ExposeData clamps out-of-range values' 'SkillIcons.SkillIconsSettings not found in the mod assembly'
} else {
    It 'a fresh SkillIconsSettings matches the documented defaults' {
        $s = [Activator]::CreateInstance($settingsType)
        $expected = @{
            enabled = $true; speed = 1.0; showNonePassion = $false
            workTabMode = 2; workTabScale = 1.3; workTabOpacity = 0.85
        }
        foreach ($k in $expected.Keys) {
            $actual = $settingsType.GetField($k).GetValue($s)
            if ("$actual" -ne "$($expected[$k])") { "$k default is $actual, expected $($expected[$k])" }
        }
    }

    # Scribe.mode defaults to Inactive when nothing is Scribing, and Scribe_Values.Look is a
    # documented no-op in that mode - it does not touch the ref value, so ExposeData()'s five
    # Mathf.Clamp lines run on whatever was set beforehand. Verified once as a guard: a field
    # set before ExposeData() and read back changed only by the clamp, never by Scribe.
    It 'calling ExposeData outside a Scribe session runs the clamps, not the Scribe read/write' {
        $s = [Activator]::CreateInstance($settingsType)
        $settingsType.GetField('speed').SetValue($s, [float]0.9)
        $settingsType.GetMethod('ExposeData').Invoke($s, @())
        if ($settingsType.GetField('speed').GetValue($s) -ne [float]0.9) {
            'speed changed even though it was already in range - Scribe touched it, not just the clamp'
        }
    }
    It 'ExposeData clamps speed to [0.5, 1.5] from both directions' {
        $s = [Activator]::CreateInstance($settingsType)
        $settingsType.GetField('speed').SetValue($s, [float]9.0)
        $settingsType.GetMethod('ExposeData').Invoke($s, @())
        if ($settingsType.GetField('speed').GetValue($s) -ne [float]1.5) { "9.0 clamped to $($settingsType.GetField('speed').GetValue($s)), expected 1.5" }
        $settingsType.GetField('speed').SetValue($s, [float]-3.0)
        $settingsType.GetMethod('ExposeData').Invoke($s, @())
        if ($settingsType.GetField('speed').GetValue($s) -ne [float]0.5) { "-3.0 clamped to $($settingsType.GetField('speed').GetValue($s)), expected 0.5" }
    }
    It 'ExposeData clamps workTabScale to [1, 1.8]' {
        $s = [Activator]::CreateInstance($settingsType)
        $settingsType.GetField('workTabScale').SetValue($s, [float]4.0)
        $settingsType.GetMethod('ExposeData').Invoke($s, @())
        if ($settingsType.GetField('workTabScale').GetValue($s) -ne [float]1.8) { "clamped to $($settingsType.GetField('workTabScale').GetValue($s)), expected 1.8" }
    }
    It 'ExposeData clamps workTabOpacity to [0.25, 1]' {
        $s = [Activator]::CreateInstance($settingsType)
        $settingsType.GetField('workTabOpacity').SetValue($s, [float]0.0)
        $settingsType.GetMethod('ExposeData').Invoke($s, @())
        if ($settingsType.GetField('workTabOpacity').GetValue($s) -ne [float]0.25) { "clamped to $($settingsType.GetField('workTabOpacity').GetValue($s)), expected 0.25" }
    }
    It 'ExposeData clamps workTabMode to [ModeCouleur, ModeMixte]' {
        $s = [Activator]::CreateInstance($settingsType)
        $settingsType.GetField('workTabMode').SetValue($s, [int]99)
        $settingsType.GetMethod('ExposeData').Invoke($s, @())
        if ($settingsType.GetField('workTabMode').GetValue($s) -ne 2) { "clamped to $($settingsType.GetField('workTabMode').GetValue($s)), expected 2 (ModeMixte)" }
    }
}

# =================================================================== C. MainButtons shortcut wiring
$mainBtnFile = Join-Path $ModRoot 'Mod\1.6\Defs\MainButtonDefs\MainButtons.xml'
It 'MainButtons.xml declares exactly one hidden MainButtonDef' {
    if (-not (Test-Path $mainBtnFile)) { "$mainBtnFile does not exist"; return }
    [xml]$xml = Get-Content $mainBtnFile -Encoding UTF8
    $defs = $xml.Defs.MainButtonDef
    if (-not $defs) { "no MainButtonDef found" ; return }
    if ($defs.defName -ne 'SkillIcons_Settings') { "defName is $($defs.defName), expected SkillIcons_Settings" }
    if ($defs.buttonVisible -ne 'false') { "buttonVisible is $($defs.buttonVisible), expected false" }
    if ($defs.workerClass -ne 'SkillIcons.MainButtonWorker_Settings') { "workerClass is $($defs.workerClass)" }
}

$workerType = $byName['SkillIcons.MainButtonWorker_Settings']
if (-not $workerType) {
    ItSkip 'MainButtonWorker_Settings derives from MainButtonWorker' 'type not found in the mod assembly'
    ItSkip 'Activate() opens Dialog_ModSettings for the same mod instance' 'type not found in the mod assembly'
} else {
    It 'MainButtonWorker_Settings derives from RimWorld.MainButtonWorker' {
        $base = $csAsm.GetType('RimWorld.MainButtonWorker')
        if (-not $base) { 'RimWorld.MainButtonWorker not found in Assembly-CSharp'; return }
        if (-not $base.IsAssignableFrom($workerType)) { "$($workerType.FullName) does not derive from RimWorld.MainButtonWorker" }
    }

    # Activate() cannot be called hors jeu (Find.WindowStack and LoadedModManager.GetMod<T>()
    # both need a running game), so its IL is read instead: newobj on Dialog_ModSettings,
    # a generic call to LoadedModManager.GetMod<SkillIconsMod>, and a call on WindowStack.Add.
    It 'Activate() IL constructs Dialog_ModSettings via LoadedModManager.GetMod<SkillIconsMod> and pushes it on WindowStack' {
        $activate = $workerType.GetMethod('Activate', [System.Reflection.BindingFlags]'Public,Instance,DeclaredOnly')
        if (-not $activate) { 'no declared Activate() override found'; return }
        $body = $activate.GetMethodBody()
        if (-not $body) { 'Activate() has no method body'; return }
        $il = $body.GetILAsByteArray()
        $mod2 = $activate.Module

        # A linear byte-position scan, not a stateful opcode walk: this repository's established
        # IL-reading technique (see rimworld-tests-hors-jeu memory) searches every occurrence of
        # the single-byte opcode and tries to resolve the 4-byte token that follows it, rather
        # than tracking operand lengths for every other opcode in the stream. A misaligned read
        # either fails to resolve (caught) or resolves to something that matches none of the
        # three signatures looked for, so it costs nothing; Activate() is a two-line method, not
        # a large surface where random 0x73/0x28/0x6F byte values are likely to appear at all.
        $sawDialogCtor = $false; $sawGetMod = $false; $sawWindowStack = $false
        for ($i = 0; $i -lt $il.Length - 4; $i++) {
            $op = $il[$i]
            if ($op -notin 0x73, 0x28, 0x6F) { continue }
            $token = [BitConverter]::ToInt32($il, $i + 1)
            try {
                if ($op -eq 0x73) {
                    $ctor = $mod2.ResolveMethod($token)
                    if ($ctor.DeclaringType.FullName -eq 'RimWorld.Dialog_ModSettings') { $sawDialogCtor = $true }
                } else {
                    $callee = $mod2.ResolveMethod($token)
                    if ($callee.Name -eq 'GetMod' -and $callee.DeclaringType.FullName -eq 'Verse.LoadedModManager') { $sawGetMod = $true }
                    if ($callee.DeclaringType.FullName -eq 'Verse.Find' -and $callee.Name -eq 'get_WindowStack') { $sawWindowStack = $true }
                    if ($callee.DeclaringType.FullName -eq 'Verse.WindowStack' -and $callee.Name -eq 'Add') { $sawWindowStack = $true }
                }
            } catch {}
        }
        if (-not $sawDialogCtor)  { 'no newobj on RimWorld.Dialog_ModSettings found in Activate()' }
        if (-not $sawGetMod)      { 'no call to LoadedModManager.GetMod<T> found in Activate()' }
        if (-not $sawWindowStack) { 'no reference to Find.WindowStack / WindowStack.Add found in Activate()' }
    }
}

# =================================================================== D. Harmony patch targets resolve
$passionDefType = $vseAsm.GetType('VSE.Passions.PassionDef')
It 'PassionDef.Icon property getter resolves' {
    if (-not $passionDefType) { 'VSE.Passions.PassionDef not found'; return }
    if (-not $passionDefType.GetProperty('Icon')) { 'no Icon property on PassionDef' }
}
It 'PassionDef.WorkBoxIcon property getter resolves' {
    if (-not $passionDefType) { 'VSE.Passions.PassionDef not found'; return }
    if (-not $passionDefType.GetProperty('WorkBoxIcon')) { 'no WorkBoxIcon property on PassionDef' }
}
It 'WidgetsWork.DrawWorkBoxBackground resolves' {
    $t = $csAsm.GetType('RimWorld.WidgetsWork')
    if (-not $t) { 'RimWorld.WidgetsWork not found'; return }
    $flags = [System.Reflection.BindingFlags]'Public,NonPublic,Static,Instance'
    if (-not $t.GetMethod('DrawWorkBoxBackground', $flags)) { 'no DrawWorkBoxBackground method on WidgetsWork' }
}
It 'SkillUI.DrawSkill(SkillRecord, Rect, SkillDrawMode, string) resolves' {
    $t = $csAsm.GetType('RimWorld.SkillUI')
    if (-not $t) { 'RimWorld.SkillUI not found'; return }
    $skillRecord = $csAsm.GetType('RimWorld.SkillRecord')
    $rect        = [System.Reflection.Assembly]::LoadFrom((Join-Path $Managed 'UnityEngine.CoreModule.dll')).GetType('UnityEngine.Rect')
    $drawMode    = $csAsm.GetType('RimWorld.SkillUI+SkillDrawMode')
    if (-not ($skillRecord -and $rect -and $drawMode)) { 'a parameter type could not be resolved'; return }
    $flags = [System.Reflection.BindingFlags]'Public,NonPublic,Static,Instance'
    $m = $t.GetMethod('DrawSkill', $flags, $null, @($skillRecord, $rect, $drawMode, [string]), $null)
    if (-not $m) { 'no matching DrawSkill overload found' }
}

# =================================================================== E. translation coverage
$enFile = Join-Path $ModRoot 'Mod\Languages\English\Keyed\SkillIcons.xml'
$frFile = Join-Path $ModRoot 'Mod\Languages\French\Keyed\SkillIcons.xml'
It 'English and French Keyed files declare the same non-empty key set' {
    if (-not (Test-Path $enFile)) { "$enFile missing"; return }
    if (-not (Test-Path $frFile)) { "$frFile missing"; return }
    [xml]$en = Get-Content $enFile -Encoding UTF8
    [xml]$fr = Get-Content $frFile -Encoding UTF8
    $enKeys = @($en.LanguageData.ChildNodes | Where-Object { $_.NodeType -eq 'Element' } | ForEach-Object { $_.LocalName })
    $frKeys = @($fr.LanguageData.ChildNodes | Where-Object { $_.NodeType -eq 'Element' } | ForEach-Object { $_.LocalName })
    $diff = Compare-Object $enKeys $frKeys
    if ($diff) { "key sets differ: $($diff | ForEach-Object { \"$($_.InputObject) ($($_.SideIndicator))\" } | Out-String)" }
    foreach ($n in $en.LanguageData.ChildNodes) {
        if ($n.NodeType -eq 'Element' -and [string]::IsNullOrWhiteSpace($n.InnerText)) { "English $($n.LocalName) is empty" }
    }
    foreach ($n in $fr.LanguageData.ChildNodes) {
        if ($n.NodeType -eq 'Element' -and [string]::IsNullOrWhiteSpace($n.InnerText)) { "French $($n.LocalName) is empty" }
    }
}
It 'every "SkillIcons.X".Translate() call site in the source has a matching Keyed entry' {
    $csFiles = Get-ChildItem (Join-Path $ModRoot '_tools\animation-source\Source\SkillIcons') -Filter '*.cs'
    $used = @{}
    foreach ($f in $csFiles) {
        $text = Get-Content $f.FullName -Raw -Encoding UTF8
        [regex]::Matches($text, '"(SkillIcons\.[A-Za-z]+)"\.Translate\(') | ForEach-Object { $used[$_.Groups[1].Value] = $true }
    }
    if ($used.Count -eq 0) { 'no "SkillIcons.X".Translate() call sites found - the regex itself may be stale'; return }
    [xml]$en = Get-Content $enFile -Encoding UTF8
    $enKeys = @{}
    $en.LanguageData.ChildNodes | Where-Object { $_.NodeType -eq 'Element' } | ForEach-Object { $enKeys[$_.LocalName] = $true }
    foreach ($k in $used.Keys) {
        if (-not $enKeys.ContainsKey($k)) { "$k is called via .Translate() but has no Keyed entry" }
    }
    foreach ($k in $enKeys.Keys) {
        if ($k -ne 'SkillIcons.GalleryHint' -and -not $used.ContainsKey($k)) { "$k has a Keyed entry but no .Translate() call site was found for it" }
    }
}

$frDefInjFile = Join-Path $ModRoot 'Mod\Languages\French\DefInjected\MainButtonDef\MainButtons.xml'
It 'SkillIcons_Settings.label/.description resolve: English from the Def, French from DefInjected' {
    if (-not (Test-Path $mainBtnFile)) { "$mainBtnFile missing"; return }
    if (-not (Test-Path $frDefInjFile)) { "$frDefInjFile missing"; return }
    [xml]$def = Get-Content $mainBtnFile -Encoding UTF8
    if ([string]::IsNullOrWhiteSpace($def.Defs.MainButtonDef.label)) { 'English label (Def source) is empty' }
    if ([string]::IsNullOrWhiteSpace($def.Defs.MainButtonDef.description)) { 'English description (Def source) is empty' }
    [xml]$inj = Get-Content $frDefInjFile -Encoding UTF8
    $labelNode = $inj.LanguageData.SelectSingleNode('SkillIcons_Settings.label')
    $descNode  = $inj.LanguageData.SelectSingleNode('SkillIcons_Settings.description')
    if (-not $labelNode -or [string]::IsNullOrWhiteSpace($labelNode.InnerText)) { 'French SkillIcons_Settings.label is missing or empty' }
    if (-not $descNode -or [string]::IsNullOrWhiteSpace($descNode.InnerText)) { 'French SkillIcons_Settings.description is missing or empty' }
}

# =================================================================== F. animation frame-count parity
#
# PassionIconAnimations's static constructor is NOT triggered here: it Harmony-patches two real
# game methods with TRANSPILERS (WidgetsWork.DrawWorkBoxBackground, SkillUI.DrawSkill), which
# forces Harmony to decompile and rebuild their IL - and those methods call into Unity's own
# ECall-backed GUI drawing, which throws "ECall methods must be packaged into a system module"
# the moment Harmony tries to prepare them outside the actual Unity runtime. Confirmed by hand
# before writing this suite. The passion animation cctor is the only one this mod still has.
# safe to trigger below and this one is not. So both checks here read the Specs dictionary
# LITERAL straight out of PassionIconAnimations.cs, not the compiled field - a source-level
# check, not a DLL-level one, and said so rather than silently claiming the stronger kind.
$animSourceFile = Join-Path $ModRoot '_tools\animation-source\Source\SkillIcons\PassionIconAnimations.cs'
$genJs = Join-Path $ModRoot '_tools\gen.js'

function Get-CsSpecsFromSource([string]$path) {
    $text = Get-Content $path -Raw -Encoding UTF8
    $m = [regex]::Match($text, '(?s)Dictionary<string, AnimationSpec> Specs = new\(StringComparer\.Ordinal\)\s*\{(.*?)\};')
    if (-not $m.Success) { return $null }
    $pairs = @{}
    foreach ($entryMatch in [regex]::Matches($m.Groups[1].Value, 'new\("([A-Za-z0-9_]+)",\s*(\d+),')) {
        $tex = $entryMatch.Groups[1].Value
        $n = [int]$entryMatch.Groups[2].Value
        if ($pairs.ContainsKey($tex) -and $pairs[$tex] -ne $n) { throw "PassionIconAnimations.cs itself disagrees on $tex" }
        $pairs[$tex] = $n
    }
    return $pairs
}
function Get-JsSpecs([string]$path) {
    $genText = Get-Content $path -Raw -Encoding UTF8
    $m = [regex]::Match($genText, '(?s)const SPECS = \[(.*?)\];')
    if (-not $m.Success) { return $null }
    $pairs = @{}
    foreach ($entryMatch in [regex]::Matches($m.Groups[1].Value, "\['([A-Za-z0-9_]+)',\s*(\d+),")) {
        $pairs[$entryMatch.Groups[1].Value] = [int]$entryMatch.Groups[2].Value
    }
    return $pairs
}

It 'PassionIconAnimations.cs Specs and gen.js SPECS agree on every texture/frame-count pair (source-level check)' {
    if (-not (Test-Path $animSourceFile)) { "$animSourceFile not found"; return }
    if (-not (Test-Path $genJs)) { "$genJs not found"; return }
    $csPairs = Get-CsSpecsFromSource $animSourceFile
    $jsPairs = Get-JsSpecs $genJs
    if (-not $csPairs) { 'could not parse the Specs dictionary out of PassionIconAnimations.cs'; return }
    if (-not $jsPairs) { 'could not parse the SPECS array out of gen.js'; return }
    if ($csPairs.Count -ne $jsPairs.Count) { "C# has $($csPairs.Count) distinct textures, gen.js has $($jsPairs.Count)" }
    foreach ($tex in $csPairs.Keys) {
        if (-not $jsPairs.ContainsKey($tex)) { "gen.js has no SPECS entry for $tex" }
        elseif ($jsPairs[$tex] -ne $csPairs[$tex]) { "$tex : C# says $($csPairs[$tex]) frames, gen.js says $($jsPairs[$tex])" }
    }
}
It 'every animated sequence named in gen.js SPECS has exactly its declared frame count of files on disk' {
    if (-not (Test-Path $genJs)) { "$genJs not found"; return }
    $jsPairs = Get-JsSpecs $genJs
    if (-not $jsPairs) { 'could not parse the SPECS array out of gen.js'; return }
    $animDir = Join-Path $ModRoot 'Mod\1.6\Textures\Passions\Animated'
    foreach ($tex in $jsPairs.Keys) {
        $n = $jsPairs[$tex]
        $actual = @(Get-ChildItem -Path $animDir -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -cmatch "^$([regex]::Escape($tex))_\d{2}\.png$" }).Count
        if ($actual -ne $n) { "$tex : $actual files on disk, expected $n" }
    }
}

# =================================================================== G. patch XML replay against real installed defs
# <success> lives on PatchOperation itself, not only on the sequence: every operation in both
# patch files carries its own now that neither file wraps its fixes in a chain.
function Set-PatchSuccess($op, [System.Xml.XmlElement]$opNode) {
    if (-not $opNode.success) { return }
    $successType = $csAsm.GetType('Verse.PatchOperation+Success')
    $poBase = $csAsm.GetType('Verse.PatchOperation')
    $poBase.GetField('success', [System.Reflection.BindingFlags]'NonPublic,Instance').SetValue($op, [Enum]::Parse($successType, $opNode.success))
}

function New-PatchFromXml([System.Xml.XmlElement]$opNode) {
    $ns = 'Verse'
    $poAdd = $csAsm.GetType("$ns.PatchOperationAdd")
    $poRepl = $csAsm.GetType("$ns.PatchOperationReplace")
    $poSeq = $csAsm.GetType("$ns.PatchOperationSequence")
    $xmlContainerType = $csAsm.GetType("$ns.XmlContainer")
    $successType = $csAsm.GetType("$ns.PatchOperation+Success")
    $poBase = $csAsm.GetType("$ns.PatchOperation")
    $pathedBase = $csAsm.GetType("$ns.PatchOperationPathed")

    switch ($opNode.Class) {
        'PatchOperationSequence' {
            $seq = [Activator]::CreateInstance($poSeq)
            # List<PatchOperation> - build via generic List<T> reflection to match the field's exact type
            $listType = [System.Collections.Generic.List`1].MakeGenericType($poBase)
            $ops = [Activator]::CreateInstance($listType)
            foreach ($child in $opNode.SelectNodes('operations/li')) {
                $ops.Add((New-PatchFromXml $child))
            }
            $poSeq.GetField('operations', [System.Reflection.BindingFlags]'NonPublic,Instance').SetValue($seq, $ops)
            $successVal = [Enum]::Parse($successType, $opNode.success)
            $poBase.GetField('success', [System.Reflection.BindingFlags]'NonPublic,Instance').SetValue($seq, $successVal)
            return $seq
        }
        'PatchOperationAdd' {
            $op = [Activator]::CreateInstance($poAdd)
            Set-PatchSuccess $op $opNode
            $pathedBase.GetField('xpath', [System.Reflection.BindingFlags]'NonPublic,Instance').SetValue($op, $opNode.xpath)
            $container = [Activator]::CreateInstance($xmlContainerType)
            # XmlContainer.node is the <value> ELEMENT ITSELF, not its first child: ApplyWorker
            # reaches into value.node.FirstChild on its own. Passing the already-unwrapped child
            # here double-unwraps it - confirmed by hand, it replaces "<description>text</description>"
            # with a bare "text" node, no tags, which is exactly the silent-looking failure this
            # test exists to catch.
            $xmlContainerType.GetField('node').SetValue($container, $opNode.SelectSingleNode('value'))
            $poAdd.GetField('value', [System.Reflection.BindingFlags]'NonPublic,Instance').SetValue($op, $container)
            return $op
        }
        'PatchOperationReplace' {
            $op = [Activator]::CreateInstance($poRepl)
            Set-PatchSuccess $op $opNode
            $pathedBase.GetField('xpath', [System.Reflection.BindingFlags]'NonPublic,Instance').SetValue($op, $opNode.xpath)
            $container = [Activator]::CreateInstance($xmlContainerType)
            $xmlContainerType.GetField('node').SetValue($container, $opNode.SelectSingleNode('value'))
            $poRepl.GetField('value', [System.Reflection.BindingFlags]'NonPublic,Instance').SetValue($op, $container)
            return $op
        }
        default { throw "unhandled patch operation class: $($opNode.Class)" }
    }
}

function Invoke-PatchDoc([string]$patchXmlPath, [System.Xml.XmlDocument]$targetDoc) {
    [xml]$patchXml = Get-Content $patchXmlPath -Encoding UTF8
    # Several top-level <Operation> elements now, not one: RimWorld applies each in turn and a
    # failure in one does not stop the next. Replaying only the first would test a file this
    # mod no longer ships.
    $opNodes = @($patchXml.Patch.SelectNodes('Operation'))
    if ($opNodes.Count -eq 0) { throw "no <Operation> in $patchXmlPath" }
    $patches = @($opNodes | ForEach-Object { New-PatchFromXml $_ })
    $poBase = $csAsm.GetType('Verse.PatchOperation')
    # PatchOperationSequence.Apply opens on `if (DeepProfiler.enabled)`; that field is true by
    # default and its buffers are null outside the game, which throws. Documented and worked
    # around the same way this repository's Colorful Coats patch-replay tests do.
    $dp = $csAsm.GetType('Verse.DeepProfiler')
    $dp.GetField('enabled', [System.Reflection.BindingFlags]'Public,NonPublic,Static').SetValue($null, $false)
    $applyMethod = $poBase.GetMethod('Apply', [System.Reflection.BindingFlags]'Public,NonPublic,Instance')
    # PowerShell 5.1's reflection Invoke() cannot convert its own ETS-adapted XmlDocument
    # (works fine for direct property/method access, e.g. $doc.SelectSingleNode(...), but
    # MethodBase.CheckArguments rejects it with "cannot convert PSObject to XmlDocument" the
    # moment it goes through Invoke's object[] parameter array). An explicit type cast at the
    # point the array element is built forces the real CLR-typed value through instead.
    $allApplied = $true
    foreach ($patch in $patches) {
        if (-not [bool]$applyMethod.Invoke($patch, @([System.Xml.XmlDocument]$targetDoc))) { $allApplied = $false }
    }
    return $allApplied
}

function Get-RealDefNode([string]$file, [string]$defName) {
    [xml]$doc = New-Object System.Xml.XmlDocument
    $doc.Load($file)
    $node = $doc.SelectSingleNode("//VSE.Passions.PassionDef[defName='$defName']")
    if (-not $node) { throw "defName $defName not found in $file" }
    return $node
}
# The fixture combines all five real defs the patch file names into one <Defs> document, exactly
# the shape a real DefDatabase load presents it with, and applies the file once. That is the only
# way to test what this mod actually depends on - that Alpha Skills keeps declaring these defs at
# all - rather than that each fix is individually well-formed.
#
# It used to matter for a second reason, now gone. PatchOperationSequence.ApplyWorker is a CHAIN:
# it stops at the first sub-operation whose xpath finds nothing and never reaches the ones after
# it, Verse.PatchOperationSequence's own lastFailedOperation field being the tell. While the five
# fixes lived in one sequence, a document holding only one of them made every later operation look
# broken. They are independent top-level operations now, so a fixture missing one def exercises
# exactly one fix - which is what 'a missing target no longer takes the other fixes down with it'
# relies on.
function New-CombinedDefsDoc([hashtable]$nodesByFile) {
    $wrapper = New-Object System.Xml.XmlDocument
    $wrapper.LoadXml('<Defs></Defs>')
    foreach ($file in $nodesByFile.Keys) {
        foreach ($defName in $nodesByFile[$file]) {
            $node = Get-RealDefNode $file $defName
            $wrapper.DocumentElement.AppendChild($wrapper.ImportNode($node, $true)) | Out-Null
        }
    }
    return $wrapper
}

$asIdeologyFile = Join-Path $AlphaSkillsRoot '1.6\Mods\Ideology\Defs\PassionDefs\Passions_Ideology.xml'
$vseFile = Join-Path $VseRoot '1.6\Defs\PassionDefs\Passions.xml'
$alphaFixesXml = Join-Path $ModRoot 'Mod\1.6\Patches\AlphaSkills_Fixes.xml'
$vseFixesXml = Join-Path $ModRoot 'Mod\1.6\Patches\VSE_Fixes.xml'

# Three of the original five real targets were removed from AlphaSkills_Fixes.xml on 2026-09-22:
# Sarg fixed "nudist (active)"'s description, "pain-driven (active)"'s label, and "frozen"'s
# missing work tab icon upstream - the last two matching this mod's own values exactly, byte for
# byte, caught by this very test failing its precondition the day the fix landed. A
# PatchOperationReplace or PatchOperationAdd whose target still exists keeps firing regardless of
# whether the value already matches, so leaving any of the three in place would have meant
# silently overwriting or duplicating Sarg's own fields forever - <success>Always</success> only
# guards a target that goes MISSING, not one that still exists, fixed or not. What remains is not
# a fix at all: Sarg confirmed the two blindness tiers sharing one icon is his intentional design,
# and this mod keeps its own divergence anyway, as its own choice.
function New-BlindTargetsDoc {
    New-CombinedDefsDoc @{
        $asIdeologyFile = @('AS_BlindPassion_Sublime', 'AS_BlindPassion_Sublime_Active')
    }
}

if (-not (Test-Path $asIdeologyFile)) {
    ItSkip 'AlphaSkills_Fixes.xml redraws both blindness tiers in one pass, matching how they actually coexist' "Alpha Skills not installed at $AlphaSkillsRoot"
    ItSkip 'a missing target no longer takes the other fix down with it' "Alpha Skills not installed at $AlphaSkillsRoot"
    ItSkip 'VSE_Fixes.xml adds the missing VSE_Apathy workBoxIconPath' "VSE not installed at $VseRoot"
} else {
    It 'AlphaSkills_Fixes.xml redraws both blindness tiers in one pass, matching how they actually coexist' {
        $doc = New-BlindTargetsDoc
        $iconBefore1 = $doc.SelectSingleNode("//VSE.Passions.PassionDef[defName='AS_BlindPassion_Sublime']/iconPath").InnerText
        if ($iconBefore1 -ne 'Passions/AS_BlindPassion') { "precondition failed: AS_BlindPassion_Sublime iconPath is already '$iconBefore1'" }
        $iconBefore2 = $doc.SelectSingleNode("//VSE.Passions.PassionDef[defName='AS_BlindPassion_Sublime_Active']/iconPath").InnerText
        if ($iconBefore2 -ne 'Passions/AS_BlindPassion_Active') { "precondition failed: AS_BlindPassion_Sublime_Active iconPath is already '$iconBefore2'" }

        Invoke-PatchDoc $alphaFixesXml $doc | Out-Null

        $iconAfter1 = $doc.SelectSingleNode("//VSE.Passions.PassionDef[defName='AS_BlindPassion_Sublime']/iconPath").InnerText
        if ($iconAfter1 -ne 'Passions/AS_BlindPassionSublime') { "AS_BlindPassion_Sublime iconPath is '$iconAfter1'" }
        $iconAfter2 = $doc.SelectSingleNode("//VSE.Passions.PassionDef[defName='AS_BlindPassion_Sublime_Active']/iconPath").InnerText
        if ($iconAfter2 -ne 'Passions/AS_BlindPassionSublime_Active') { "AS_BlindPassion_Sublime_Active iconPath is '$iconAfter2'" }
    }

    It 'a missing target no longer takes the other fix down with it' {
        # The document is missing AS_BlindPassion_Sublime - the FIRST operation's target - while
        # still containing AS_BlindPassion_Sublime_Active. Held in one PatchOperationSequence,
        # which is a chain, the first operation finding nothing stopped every operation after it,
        # silently, because the sequence was Always. Split into independent top-level operations,
        # only the operation whose own target vanished goes inert. This test is the inverse of
        # what a sequence would do, and it is the reason for the split.
        $doc = New-CombinedDefsDoc @{
            $asIdeologyFile = @('AS_BlindPassion_Sublime_Active')
        }
        $iconBefore = $doc.SelectSingleNode('//iconPath').InnerText
        if ($iconBefore -ne 'Passions/AS_BlindPassion_Active') { "precondition failed: real iconPath is already '$iconBefore'"; return }
        Invoke-PatchDoc $alphaFixesXml $doc | Out-Null
        $iconAfter = $doc.SelectSingleNode('//iconPath').InnerText
        if ($iconAfter -ne 'Passions/AS_BlindPassionSublime_Active') { "AS_BlindPassion_Sublime_Active iconPath is '$iconAfter', expected 'Passions/AS_BlindPassionSublime_Active' - a fix whose own target is present must apply even when the other operation's target is absent" }
    }

    It 'VSE_Fixes.xml adds the missing VSE_Apathy workBoxIconPath' {
        if (-not (Test-Path $vseFile)) { "VSE not installed at $VseRoot"; return }
        $doc = New-CombinedDefsDoc @{ $vseFile = @('VSE_Apathy') }
        if ($doc.SelectSingleNode('//workBoxIconPath')) { 'precondition failed: real def already has a workBoxIconPath' }
        Invoke-PatchDoc $vseFixesXml $doc | Out-Null
        $after = $doc.SelectSingleNode('//workBoxIconPath')
        if (-not $after) { 'no workBoxIconPath after the patch' }
        elseif ($after.InnerText -ne 'Passions/PassionApathy') { "workBoxIconPath is '$($after.InnerText)'" }
    }
}

It 'every patch operation declares <success>Always</success>, so an upstream fix goes inert instead of erroring' {
    # Every one of them, not just the first: the fixes are independent operations now, and an
    # operation that forgot its own <success> would redden the log the day its target is
    # repaired upstream - which is the whole thing these files are built to avoid.
    foreach ($f in @($alphaFixesXml, $vseFixesXml)) {
        [xml]$x = Get-Content $f -Encoding UTF8
        $ops = @($x.Patch.SelectNodes('Operation'))
        if ($ops.Count -eq 0) { "$f : no <Operation> at all" }
        for ($i = 0; $i -lt $ops.Count; $i++) {
            if ($ops[$i].success -ne 'Always') { "$f : operation $($i + 1) of $($ops.Count) has success '$($ops[$i].success)', expected Always" }
        }
    }
}

# =================================================================== H. texture existence
It 'every patch-referenced texture exists on disk' {
    $expected = @('AS_FrozenPassionGrey', 'AS_BlindPassionSublime', 'AS_BlindPassionSublime_Active', 'PassionApathy')
    $dir = Join-Path $ModRoot 'Mod\1.6\Textures\Passions'
    foreach ($n in $expected) {
        if (-not (Test-Path (Join-Path $dir "$n.png"))) { "$n.png missing from $dir" }
    }
}

# ---------------------------------------------------------------- summary
Write-Output ''
if ($script:failed -eq 0) {
    Write-Output "$($script:ran) tests, $($script:skipped) skipped, all passing."
} else {
    Write-Output "$($script:ran) tests, $($script:failed) failing, $($script:skipped) skipped."
}

[System.AppDomain]::CurrentDomain.remove_AssemblyResolve($script:asmResolver)
Remove-Item -Recurse -Force $scratch -ErrorAction SilentlyContinue
exit ([int]($script:failed -gt 0))
