$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$environmentPath = Join-Path $projectDirectory '.env'
if (-not (Test-Path -LiteralPath $environmentPath)) {
    $values = @{}
    foreach ($key in @('DB_PASSWORD', 'KEYCLOAK_DB_PASSWORD', 'KEYCLOAK_ADMIN_PASSWORD',
            'KEYCLOAK_CLIENT_SECRET', 'DEMO_ALEX_PASSWORD', 'DEMO_SAM_PASSWORD', 'DEMO_TAYLOR_PASSWORD')) {
        $randomBytes = New-Object byte[] 24
        $randomGenerator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        try { $randomGenerator.GetBytes($randomBytes) } finally { $randomGenerator.Dispose() }
        $values[$key] = [BitConverter]::ToString($randomBytes).Replace('-', '') + 'aA!9'
    }
    $values.GetEnumerator() | Sort-Object Key | ForEach-Object { "$($_.Key)=$($_.Value)" } |
        Set-Content -LiteralPath $environmentPath -Encoding utf8
}
$values = @{}
foreach ($line in Get-Content -LiteralPath $environmentPath) {
    if ($line -match '^([A-Z_]+)=(.*)$') { $values[$Matches[1]] = $Matches[2] }
}
foreach ($key in @('DB_PASSWORD', 'KEYCLOAK_DB_PASSWORD', 'KEYCLOAK_ADMIN_PASSWORD',
        'KEYCLOAK_CLIENT_SECRET', 'DEMO_ALEX_PASSWORD', 'DEMO_SAM_PASSWORD', 'DEMO_TAYLOR_PASSWORD')) {
    if (-not $values[$key]) { throw "Missing $key in local .env" }
}
$realm = Get-Content -LiteralPath (Join-Path $projectDirectory 'infra/keycloak/realm-template.json') -Raw | ConvertFrom-Json
$realm.clients[0] | Add-Member -NotePropertyName secret -NotePropertyValue $values['KEYCLOAK_CLIENT_SECRET']
$keys = @('DEMO_ALEX_PASSWORD', 'DEMO_SAM_PASSWORD', 'DEMO_TAYLOR_PASSWORD')
for ($index = 0; $index -lt $keys.Length; $index++) {
    $realm.users[$index] | Add-Member -NotePropertyName credentials -NotePropertyValue @(
        @{ type = 'password'; value = $values[$keys[$index]]; temporary = $false }
    )
}
$realm | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $projectDirectory 'infra/keycloak/knowledge-base-realm.json') -Encoding utf8
Write-Output 'Local credentials are in ignored .env; the ignored Keycloak import file is ready.'
Write-Output 'Run docker compose up -d, wait for Keycloak, then run scripts/backend.ps1 run.'
