# start-mcp.ps1 — Launches the MediaWiki MCP server pointed at the NITC Wiki (Windows PowerShell)

# Pin the upstream server so every beta tester runs the same version.
# To upgrade, bump this and update CHANGELOG.md.
$MCP_VERSION = "0.10.0"

# Check for npx
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is required (version 22.12 or newer)."
    Write-Error "Install it from https://nodejs.org and try again."
    exit 1
}

# Soft Node version check — warn but don't block.
try {
    $NODE_MAJOR = [int](node -e "console.log(process.versions.node.split('.')[0])" 2>$null)
    if ($NODE_MAJOR -lt 22) {
        Write-Warning "Node $NODE_MAJOR detected. This server needs Node 22.12+."
        Write-Warning "If startup fails, upgrade Node from https://nodejs.org"
    }
} catch {
    Write-Warning "Could not detect Node version."
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location (Join-Path $scriptDir "..")

# Load credentials from .env if present
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2].Trim('"')
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

if (-not (Test-Path config.json)) {
    @"
{
  "defaultWiki": "wiki.fosscell.org",
  "wikis": {
    "wiki.fosscell.org": {
      "sitename": "WIKI FOSSCELL NITC",
      "server": "https://wiki.fosscell.org",
      "articlepath": "",
      "scriptpath": "",
      "username": null,
      "password": null,
      "private": false
    }
  }
}
"@ | Set-Content config.json -Encoding UTF8
}

$env:CONFIG = (Resolve-Path config.json).Path
npx "@professional-wiki/mediawiki-mcp-server@${MCP_VERSION}" @args