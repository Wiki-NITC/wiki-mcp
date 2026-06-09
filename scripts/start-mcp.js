#!/usr/bin/env node
// Cross-platform launcher for MediaWiki MCP server
// Detects OS and runs appropriate startup script

import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const isWindows = platform() === 'win32';
const script = isWindows ? 'start-mcp.ps1' : 'start-mcp.sh';
const scriptPath = join(__dirname, script);
const args = process.argv.slice(2);

const child = spawn(isWindows ? 'powershell' : 'bash', [isWindows ? '-File' : '', scriptPath, ...args].filter(Boolean), {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env },
});

child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (err) => {
  console.error(`Failed to start ${script}:`, err.message);
  process.exit(1);
});