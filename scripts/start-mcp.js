#!/usr/bin/env node
// start-mcp.js - Launches the MediaWiki MCP server pointed at the NITC Wiki.
//
// Single cross-platform launcher (Windows, macOS, Linux). On first run this
// creates a credential-less config.json so that *reading* the wiki works with
// no setup. Put BOT_USERNAME/BOT_PASSWORD in .env to enable editing; they are
// synced into config.json on every launch. See README.md.
//
// IMPORTANT: stdout is the MCP stdio channel. Never print to stdout here -
// all launcher output goes to stderr.

"use strict";

const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");

// Pin the upstream server so every user runs the same version.
// To upgrade, bump this and update CHANGELOG.md.
const MCP_VERSION = "0.13.1";

const DEFAULT_WIKI = "wiki.fosscell.org";

const repoRoot = path.resolve(__dirname, "..");
const configPath = path.join(repoRoot, "config.json");
const envPath = path.join(repoRoot, ".env");

function log(msg) {
  process.stderr.write(`[start-mcp] ${msg}\n`);
}

// --- Node version soft check -------------------------------------------------
const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
if (nodeMajor < 22) {
  log(`Warning: Node ${process.versions.node} detected. The server needs Node 22.12+.`);
  log("If startup fails, upgrade Node from https://nodejs.org");
}

// --- Self-update check --------------------------------------------------------
// Rules and skills only help if people run the current ones. On every launch,
// fetch origin and fast-forward to origin/main when it is safe to do so
// (git repo, on main, clean working tree). Anything else degrades to a
// reminder on stderr. Never blocks or breaks startup: any failure (offline,
// no git, ZIP download) is swallowed and the server starts as-is.
function checkForUpdates() {
  const run = (cmd, timeout = 10000) =>
    execSync(cmd, { cwd: repoRoot, timeout, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  try {
    if (!fs.existsSync(path.join(repoRoot, ".git"))) return; // ZIP install, no git
    execSync("git fetch --quiet origin main", {
      cwd: repoRoot,
      timeout: 15000,
      stdio: "ignore",
    });
    const behind = parseInt(run("git rev-list --count HEAD..origin/main"), 10);
    if (!behind) return;
    const dirty = run("git status --porcelain") !== "";
    const branch = run("git rev-parse --abbrev-ref HEAD");
    if (dirty || branch !== "main") {
      const reason = dirty ? "local changes present" : `on branch ${branch}`;
      log(`Update available: ${behind} commit(s) behind origin/main (auto-update skipped: ${reason}). Run 'git pull' when convenient.`);
      return;
    }
    try {
      execSync("git merge --ff-only --quiet origin/main", {
        cwd: repoRoot,
        timeout: 10000,
        stdio: "ignore",
      });
      log(`Auto-updated wiki-mcp: ${behind} new commit(s) from origin/main. Launcher changes take effect on the next restart.`);
    } catch {
      log(`Update available: ${behind} commit(s) behind origin/main, but history has diverged. Run 'git pull' manually.`);
    }
  } catch {
    // Offline, git missing, or anything unexpected - never block startup.
  }
}
checkForUpdates();

// --- Bootstrap config.json on first run --------------------------------------
// This shape must stay byte-compatible with config.example.json and with what
// scripts/validate-config.js checks.
const defaultConfig = {
  defaultWiki: DEFAULT_WIKI,
  wikis: {
    [DEFAULT_WIKI]: {
      sitename: "WIKI FOSSCELL NITC",
      server: "https://wiki.fosscell.org",
      articlepath: "/",
      scriptpath: "",
      username: null,
      password: null,
      private: false,
      readOnly: false,
    },
  },
};

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2) + "\n");
  log("Created config.json (read-only access). Add credentials via .env to enable editing.");
}

// --- Sync .env credentials into config.json ----------------------------------
// .env is the single place to update on a bot-password rotation. It WINS over
// hand-edited config.json credentials; a notice is printed when it overwrites
// a differing value.
function parseEnvFile(file) {
  const vars = {};
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

if (fs.existsSync(envPath)) {
  const env = parseEnvFile(envPath);
  if (env.BOT_USERNAME && env.BOT_PASSWORD) {
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (err) {
      log(`Error: config.json is not valid JSON (${err.message}).`);
      log("Fix or delete config.json (it will be recreated), then retry.");
      process.exit(1);
    }
    const wikiKey = config.defaultWiki || DEFAULT_WIKI;
    const wiki = (config.wikis && config.wikis[wikiKey]) || null;
    if (!wiki) {
      log(`Error: config.json has no wikis["${wikiKey}"] entry to hold credentials.`);
      process.exit(1);
    }
    const changed = wiki.username !== env.BOT_USERNAME || wiki.password !== env.BOT_PASSWORD;
    if (changed) {
      if (wiki.username && wiki.username !== env.BOT_USERNAME) {
        log(`Note: .env BOT_USERNAME overrides the differing username in config.json (.env wins).`);
      }
      wiki.username = env.BOT_USERNAME;
      wiki.password = env.BOT_PASSWORD;
      // Write via temp file + rename so a crash never leaves half a config.
      const tmpPath = configPath + ".tmp";
      fs.writeFileSync(tmpPath, JSON.stringify(config, null, 2) + "\n");
      fs.renameSync(tmpPath, configPath);
      log("Synced credentials from .env into config.json.");
    }
  }
}

// --- Launch the pinned upstream server ----------------------------------------
// npx is npx.cmd on Windows, which requires a shell; a shell needs the command
// as one string. Explicit stdio pipes (not "inherit") because inherit does not
// reliably forward piped stdin through cmd.exe on Windows - and stdin/stdout
// ARE the MCP channel.
const extraArgs = process.argv.slice(2).map((a) => JSON.stringify(a)).join(" ");
const command =
  `npx -y @professional-wiki/mediawiki-mcp-server@${MCP_VERSION}` +
  (extraArgs ? ` ${extraArgs}` : "");

const child = spawn(command, {
  cwd: repoRoot,
  env: { ...process.env, CONFIG: configPath },
  stdio: ["pipe", "pipe", "pipe"],
  shell: true,
});

// --- Inject NITC house rules into the MCP handshake --------------------------
// The upstream server has no config option for custom instructions, but every
// client connects through this launcher, so we append our rules pointer to the
// initialize response's `instructions` field. This is how agents that only
// configured the MCP server (no repo folder, no skills) still learn the house
// rules the moment they connect.
const NITC_INSTRUCTIONS =
  "MANDATORY FIRST ACTION of every session: before answering the user's " +
  "first message - even a plain greeting like 'hi' - call whoami. If it " +
  "returns an authenticated (non-anonymous) user, run their dashboard " +
  "unprompted: (1) setup check - User:<name> page, their Hello task, roster " +
  "entry on WIKI FOSSCELL NITC:Wiki Admin Team/<latest>; if anything is " +
  "missing, start onboarding right away (writes still need their " +
  "confirmation); (2) their tasks - query WikiTasks for their assigned " +
  "open/overdue items; (3) top unclaimed tasks recommended for their roster " +
  "team. Open your first reply with this compact dashboard, then handle " +
  "whatever they asked. Skipping the dashboard on the first message is a " +
  "rule violation, not a judgment call. Anonymous sessions: no dashboard, " +
  "but if the user asks about contributing or a write fails with an " +
  "authentication error, guide them through \"HowTo:Create a Wiki Account\" " +
  "then \"HowTo:Create a Bot Password\" on the wiki, then credentials in " +
  ".env and a client restart. " +
  "House rules: before your first write in a session, fetch the page " +
  "\"WIKI FOSSCELL NITC:MCP Rules\" with get-page and follow it. Do not " +
  "state capabilities from memory (e.g. uploads are DISABLED on this wiki " +
  "even though upload tools exist) - the rules page is the authority. Highlights: meeting minutes live at \"WIKI FOSSCELL " +
  "NITC:Meetings/YYYY-MM-DD\"; events at \"YYYY:EventName\" with a redirect; " +
  "task pages at \"WIKI FOSSCELL NITC:Tasks/<name>\" using Template:Task with " +
  "only the documented status/priority/category values; edit summaries are " +
  "\"Bot: <action> - <agent-name>\"; preview wikitext with parse-wikitext " +
  "before saving and batch cosmetic changes into one revision; pass latestId " +
  "on update-page; never create or edit Cargo-declaring templates. Full rules " +
  "and task-specific skills: https://github.com/Wiki-NITC/wiki-mcp";

process.stdin.pipe(child.stdin);
child.stderr.pipe(process.stderr);

let stdoutBuf = "";
let injected = false;
child.stdout.on("data", (chunk) => {
  if (injected) {
    process.stdout.write(chunk);
    return;
  }
  stdoutBuf += chunk.toString("utf8");
  let idx;
  while ((idx = stdoutBuf.indexOf("\n")) !== -1) {
    const line = stdoutBuf.slice(0, idx);
    stdoutBuf = stdoutBuf.slice(idx + 1);
    let out = line;
    if (!injected && line.includes('"serverInfo"')) {
      try {
        const msg = JSON.parse(line);
        if (msg.result && msg.result.serverInfo) {
          msg.result.instructions =
            (msg.result.instructions ? msg.result.instructions + "\n\n" : "") +
            NITC_INSTRUCTIONS;
          out = JSON.stringify(msg);
          injected = true;
        }
      } catch {
        // Not a complete/parseable JSON message - pass through untouched.
      }
    }
    process.stdout.write(out + "\n");
  }
  if (injected && stdoutBuf) {
    // Flush any partial line buffered before injection completed.
    process.stdout.write(stdoutBuf);
    stdoutBuf = "";
  }
});
child.stdout.on("end", () => {
  if (stdoutBuf) process.stdout.write(stdoutBuf);
});

child.on("error", (err) => {
  log(`Failed to launch the MCP server: ${err.message}`);
  log("Is Node.js (22.12+) installed and npx on the PATH? https://nodejs.org");
  process.exit(1);
});

child.on("exit", (code, signal) => {
  process.exit(signal ? 1 : code == null ? 1 : code);
});
