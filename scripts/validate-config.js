#!/usr/bin/env node
// validate-config.js - validates config.json for the MediaWiki MCP server.
//
// Single cross-platform implementation; validate-config.sh and
// validate-config.ps1 are thin wrappers around this file.
//
// Exit code: 1 if any FAIL was reported, 0 otherwise (WARN/INFO never fail).

"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const configPath = process.env.CONFIG || path.join(repoRoot, "config.json");

const colors = process.stderr.isTTY
  ? { red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m", reset: "\x1b[0m" }
  : { red: "", green: "", yellow: "", cyan: "", reset: "" };

let errors = 0;
let warnings = 0;

const pass = (msg) => console.error(`    ${colors.green}[PASS]${colors.reset} ${msg}`);
const fail = (msg) => { errors++; console.error(`    ${colors.red}[FAIL]${colors.reset} ${msg}`); };
const warn = (msg) => { warnings++; console.error(`    ${colors.yellow}[WARN]${colors.reset} ${msg}`); };
const info = (msg) => console.error(`    ${colors.cyan}[INFO]${colors.reset} ${msg}`);
const section = (msg) => console.error(`\n--- ${msg} ---`);

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function collectCookies(jar, response) {
  const setCookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
  for (const line of setCookies) {
    const [pair] = line.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}

const cookieHeader = (jar) =>
  Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join("; ");

async function main() {
  section("Step 1: Config file");

  if (!fs.existsSync(configPath)) {
    fail(`config.json not found at ${configPath}`);
    info("Run scripts/start-mcp.sh (or: node scripts/start-mcp.js) once to generate it,");
    info("or copy config.example.json to config.json.");
    return;
  }
  pass(`Found ${configPath}`);

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    pass("Valid JSON");
  } catch (err) {
    fail(`Invalid JSON: ${err.message}`);
    return;
  }

  section("Step 2: Top-level structure");

  if (typeof config.defaultWiki === "string" && config.defaultWiki) {
    pass(`defaultWiki = ${config.defaultWiki}`);
  } else {
    fail("Missing or empty defaultWiki");
  }

  const wikiKeys = config.wikis && typeof config.wikis === "object" ? Object.keys(config.wikis) : [];
  if (wikiKeys.length > 0) {
    pass(`${wikiKeys.length} wiki(s) configured`);
  } else {
    fail("No wikis configured under \"wikis\"");
    return;
  }

  if (config.defaultWiki && !wikiKeys.includes(config.defaultWiki)) {
    fail(`defaultWiki "${config.defaultWiki}" is not a key of "wikis"`);
  }

  for (const wikiKey of wikiKeys) {
    const wiki = config.wikis[wikiKey];

    section(`Step 3: Fields for ${wikiKey}`);

    if (wiki.sitename) pass(`sitename = ${wiki.sitename}`);
    else fail("Missing sitename");

    if (wiki.server) pass(`server = ${wiki.server}`);
    else fail("Missing server");

    for (const key of ["articlepath", "scriptpath"]) {
      if (Object.prototype.hasOwnProperty.call(wiki, key)) pass(`${key} key present ("${wiki[key]}")`);
      else fail(`Missing ${key} key (empty string is fine, the key must exist)`);
    }

    const hasCreds = Boolean(wiki.username && wiki.password);
    const hasToken = Boolean(wiki.token);
    if (wiki.private === true && !hasCreds && !hasToken) {
      warn("private: true but no credentials configured - reads will fail");
    }
    if (wiki.readOnly === true) {
      info("readOnly: true - the server will hide write tools for this wiki");
    }

    if (!wiki.server) continue;

    section(`Step 4: Connectivity for ${wikiKey}`);

    const server = String(wiki.server).replace(/\/+$/, "");
    const scriptpath = String(wiki.scriptpath || "").replace(/\/+$/, "");
    const apiUrl = `${server}${scriptpath}/api.php`;

    let siteinfoOk = false;
    try {
      const res = await fetchWithTimeout(`${apiUrl}?action=query&meta=siteinfo&format=json`);
      if (res.ok) {
        const body = await res.json();
        const remoteName = body && body.query && body.query.general && body.query.general.sitename;
        pass(`API reachable at ${apiUrl} (HTTP ${res.status})`);
        siteinfoOk = true;
        if (remoteName && wiki.sitename && remoteName !== wiki.sitename) {
          warn(`Remote sitename "${remoteName}" differs from configured "${wiki.sitename}"`);
        } else if (remoteName) {
          pass(`Remote sitename matches: ${remoteName}`);
        }
      } else {
        fail(`API returned HTTP ${res.status} at ${apiUrl}`);
      }
    } catch (err) {
      fail(`API not reachable at ${apiUrl} (${err.name === "AbortError" ? "timeout" : err.message})`);
      info("A silent timeout can mean your IP is filtered at the wiki's proxy -");
      info("check the wiki from another network (e.g. mobile data); if it loads");
      info("there, contact a wiki admin about allowlisting your IP.");
    }

    // Step 5: authenticated rights check (both platforms - this used to be
    // bash-only, leaving Windows users without the one check that predicts
    // whether editing will actually work).
    if (!hasCreds) {
      section(`Step 5: Rights check for ${wikiKey}`);
      warn("No username/password configured - skipping authenticated rights check");
      info("Read-only setups are valid; add credentials via .env to enable editing.");
      continue;
    }
    if (!siteinfoOk) continue;

    section(`Step 5: Authenticated rights check for ${wikiKey}`);

    try {
      const jar = new Map();
      const tokenRes = await fetchWithTimeout(
        `${apiUrl}?action=query&meta=tokens&type=login&format=json`
      );
      collectCookies(jar, tokenRes);
      const tokenBody = await tokenRes.json();
      const loginToken =
        tokenBody && tokenBody.query && tokenBody.query.tokens && tokenBody.query.tokens.logintoken;
      if (!loginToken) {
        warn("Could not fetch a login token; skipping rights check");
        continue;
      }

      const form = new URLSearchParams({
        action: "login",
        lgname: wiki.username,
        lgpassword: wiki.password,
        lgtoken: loginToken,
        format: "json",
      });
      const loginRes = await fetchWithTimeout(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookieHeader(jar) },
        body: form.toString(),
      });
      collectCookies(jar, loginRes);
      const loginBody = await loginRes.json();
      const result = loginBody && loginBody.login && loginBody.login.result;

      if (result !== "Success") {
        fail(`Login failed (${result || "no response"}) - check credentials in .env or config.json`);
        info("Rotation runbook: docs/rotating-credentials.md");
        continue;
      }
      pass(`Logged in as ${wiki.username}`);

      const rightsRes = await fetchWithTimeout(
        `${apiUrl}?action=query&meta=userinfo&uiprop=rights&format=json`,
        { headers: { Cookie: cookieHeader(jar) } }
      );
      const rightsBody = await rightsRes.json();
      const rights =
        (rightsBody && rightsBody.query && rightsBody.query.userinfo && rightsBody.query.userinfo.rights) || [];

      for (const right of ["edit", "createpage"]) {
        if (rights.includes(right)) pass(`Has right: ${right}`);
        else fail(`Missing right: ${right} - this account cannot edit`);
      }
      if (rights.includes("editinterface")) {
        pass("Has right: editinterface (can edit Template: pages)");
      } else {
        warn("Missing right: editinterface - Template: namespace edits will fail on this wiki (see rules/templates.md)");
      }
    } catch (err) {
      warn(`Rights check aborted (${err.name === "AbortError" ? "timeout" : err.message})`);
    }
  }
}

main()
  .catch((err) => {
    fail(`Unexpected error: ${err.message}`);
  })
  .finally(() => {
    console.error("");
    if (errors > 0) {
      console.error(`${colors.red}Config validation failed${colors.reset} (${errors} error(s), ${warnings} warning(s))`);
      process.exit(1);
    }
    console.error(`${colors.green}Config validation passed${colors.reset} (${warnings} warning(s))`);
  });
