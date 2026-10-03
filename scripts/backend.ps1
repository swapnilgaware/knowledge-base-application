param([ValidateSet('run', 'test', 'package')][string]$Task = 'run')
$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
# Load ignored local values as data, never execute the contents as shell code.
$environmentPath = Join-Path $projectDirectory '.env'
if (Test-Path -LiteralPath $environmentPath) {
    foreach ($line in Get-Content -LiteralPath $environmentPath) {
        if ($line -match '^([A-Z_]+)=(.*)$' -and -not [Environment]::GetEnvironmentVariable($Matches[1])) {
            [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
        }
    }
}
$portableJdk = Get-ChildItem -LiteralPath (Join-Path $projectDirectory '.tools') -Directory -Filter 'jdk-25*' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($portableJdk) {
    $env:JAVA_HOME = $portableJdk.FullName
    $env:PATH = $env:JAVA_HOME + '\bin;' + $env:PATH
}
$javaVersion = (& java --version | Out-String)
if ($javaVersion -notmatch '^(openjdk|java) 25[. ]') { throw 'Java 25 is required. Set JAVA_HOME to a Java 25 JDK or place one in .tools.' }
$mavenRepository = Join-Path $projectDirectory '.tools\m2'
# Use a full, short path for Windows Java NIO sockets; 8.3 TEMP aliases can fail in desktop-launched processes.
$socketDirectory = [System.IO.Path]::GetFullPath((Join-Path $projectDirectory '..\.nio'))
New-Item -ItemType Directory -Path $socketDirectory -Force | Out-Null
$previousJavaOptions = $env:JAVA_TOOL_OPTIONS
$env:JAVA_TOOL_OPTIONS = ($previousJavaOptions + ' -Djdk.net.unixdomain.tmpdir="' + $socketDirectory + '"').Trim()
Push-Location (Join-Path $projectDirectory 'backend')
try {
    $mavenArgs = @('--no-transfer-progress', "-Dmaven.repo.local=$mavenRepository")
    switch ($Task) {
        'run' { $mavenArgs += @('spring-boot:run', '-Dspring-boot.run.profiles=dev') }
        'test' { $mavenArgs += 'test' }
        'package' { $mavenArgs += 'package' }
    }
    & mvn.cmd @mavenArgs
    if ($LASTEXITCODE -ne 0) { throw "Maven exited with code $LASTEXITCODE" }
} finally {
    Pop-Location
    $env:JAVA_TOOL_OPTIONS = $previousJavaOptions
}
