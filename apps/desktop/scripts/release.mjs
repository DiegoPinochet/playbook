#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, "..");
const REPO_ROOT = resolve(APP_DIR, "../..");
const WORKSPACE_LINK_DIR = resolve(APP_DIR, "node_modules", "@playbook");

function run(cmd, args, opts = {}) {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit", cwd: APP_DIR, ...opts });
}

function out(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", cwd: APP_DIR, ...opts }).trim();
}

function fail(msg) {
  console.error(`\n✖ ${msg}`);
  process.exit(1);
}

// 1. Pre-flight
try {
  out("gh", ["--version"]);
} catch {
  fail("gh CLI not found. Install with: brew install gh");
}

let token;
try {
  token = out("gh", ["auth", "token"]);
} catch {
  fail("gh is not authenticated. Run: gh auth login");
}
if (!token) fail("Empty gh auth token");

const status = out("git", ["status", "--porcelain"], { cwd: REPO_ROOT });
if (status) {
  fail(`Working tree is not clean. Commit or stash before releasing:\n${status}`);
}

const pkg = JSON.parse(readFileSync(resolve(APP_DIR, "package.json"), "utf8"));
const version = pkg.version;
const tag = `v${version}`;
console.log(`▶ Releasing Playbook ${tag} (Mac arm64)`);

const existingTags = out("git", ["ls-remote", "--tags", "origin"], { cwd: REPO_ROOT });
if (existingTags.includes(`refs/tags/${tag}`)) {
  fail(
    `Tag ${tag} already exists on origin. Bump apps/desktop/package.json version and try again.`
  );
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
  run("pnpm", ["exec", "electron-builder", "--mac", "--arm64", "--publish", "always"], {
    env: { ...process.env, GH_TOKEN: token },
  });
} finally {
  if (removedLinks) {
    console.log("\n▶ Restoring workspace symlinks via pnpm install");
    try {
      execFileSync("pnpm", ["install", "--prefer-offline"], {
        stdio: "inherit",
        cwd: REPO_ROOT,
      });
    } catch (err) {
      console.error("⚠ Failed to restore symlinks. Run `pnpm install` manually.", err);
    }
  }
}

console.log(`\n✔ Released ${tag}`);
console.log(`  https://github.com/DiegoPinochet/playbook/releases/tag/${tag}`);
console.log(`\nNext: bump apps/desktop/package.json before the next release.`);
