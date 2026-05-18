#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, "..");
const REPO_ROOT = resolve(APP_DIR, "../..");
const WORKSPACE_LINK_DIR = resolve(APP_DIR, "node_modules", "@playbook");

const isCI = process.env.CI === "true";
const isWindows = process.platform === "win32";

function run(cmd, args, opts = {}) {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit", cwd: APP_DIR, shell: isWindows, ...opts });
}

function out(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    encoding: "utf8",
    cwd: APP_DIR,
    shell: isWindows,
    ...opts,
  }).trim();
}

function fail(msg) {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
}

function parsePlatform(argv) {
  let platform = "mac";
  for (const arg of argv) {
    if (arg.startsWith("--platform=")) {
      platform = arg.slice("--platform=".length);
    } else if (arg === "--platform") {
      fail("Use --platform=mac or --platform=win (with =), not a separate arg");
    }
  }
  if (platform !== "mac" && platform !== "win") {
    fail(`Invalid --platform: ${platform}. Expected mac or win.`);
  }
  return platform;
}

const platform = parsePlatform(process.argv.slice(2));

// 1. Pre-flight
let token;
if (isCI) {
  token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) fail("CI mode but neither GH_TOKEN nor GITHUB_TOKEN is set");
} else {
  try {
    out("gh", ["--version"]);
  } catch {
    fail("gh CLI not found. Install with: brew install gh");
  }
  try {
    token = out("gh", ["auth", "token"]);
  } catch {
    fail("gh is not authenticated. Run: gh auth login");
  }
  if (!token) fail("Empty gh auth token");
}

if (!isCI) {
  const status = out("git", ["status", "--porcelain"], { cwd: REPO_ROOT });
  if (status) {
    fail(`Working tree is not clean. Commit or stash before releasing:\n${status}`);
  }
}

const pkg = JSON.parse(readFileSync(resolve(APP_DIR, "package.json"), "utf8"));
const version = pkg.version;
const tag = `v${version}`;
const archLabel = platform === "mac" ? "Mac arm64" : "Windows x64";
console.log(`▶ Releasing Playbook ${tag} (${archLabel})`);

if (!isCI) {
  const existingTags = out("git", ["ls-remote", "--tags", "origin"], { cwd: REPO_ROOT });
  if (existingTags.includes(`refs/tags/${tag}`)) {
    fail(
      `Tag ${tag} already exists on origin. Bump apps/desktop/package.json version and try again.`
    );
  }
}

// 2. Build the renderer/main/preload bundles
run("pnpm", ["build"]);

// 3. electron-builder follows pnpm workspace symlinks (apps/desktop/node_modules/@playbook/*)
//    and rejects any file whose resolved path is outside the app dir. Workspace code is
//    bundled into out/ via electron-vite's externalizeDepsPlugin exclude list, so the
//    symlinks are not needed at runtime. Remove them for the build, restore after.
let removedLinks = false;
if (existsSync(WORKSPACE_LINK_DIR)) {
  console.log(`\n▶ Removing workspace symlinks at ${WORKSPACE_LINK_DIR}`);
  rmSync(WORKSPACE_LINK_DIR, { recursive: true, force: true });
  removedLinks = true;
}

try {
  const builderArgs =
    platform === "mac"
      ? ["--mac", "--arm64", "--publish", "always"]
      : ["--win", "--x64", "--publish", "always"];

  run("pnpm", ["exec", "electron-builder", ...builderArgs], {
    env: { ...process.env, GH_TOKEN: token },
  });
} finally {
  if (removedLinks) {
    console.log("\n▶ Restoring workspace symlinks via pnpm install");
    try {
      execFileSync("pnpm", ["install", "--prefer-offline"], {
        stdio: "inherit",
        cwd: REPO_ROOT,
        shell: isWindows,
      });
    } catch (err) {
      console.error("⚠ Failed to restore symlinks. Run `pnpm install` manually.", err);
    }
  }
}

console.log(`\n✔ Released ${tag}`);
console.log(`  https://github.com/DiegoPinochet/playbook/releases/tag/${tag}`);
console.log(`\nNext: bump apps/desktop/package.json before the next release.`);
