# validate-config.ps1 - thin wrapper. The validator lives in validate-config.js
# so Windows and Unix run the identical checks. See README.md.
#
# Usage: powershell -File scripts/validate-config.ps1 [-ConfigPath path\to\config.json]
param(
    [string]$ConfigPath = ""
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is required (version 22.12 or newer)." -ForegroundColor Red
    Write-Host "Install it from https://nodejs.org and try again."
    exit 1
}

if ($ConfigPath -ne "") {
    $env:CONFIG = $ConfigPath
}

& node (Join-Path $PSScriptRoot "validate-config.js")
exit $LASTEXITCODE
