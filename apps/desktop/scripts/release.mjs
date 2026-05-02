#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, "..");

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

const status = out("git", ["status", "--porcelain"], { cwd: resolve(APP_DIR, "../..") });
if (status) {
  fail(
    `Working tree is not clean. Commit or stash before releasing:\n${status}`
  );
}

const pkg = JSON.parse(readFileSync(resolve(APP_DIR, "package.json"), "utf8"));
const version = pkg.version;
const tag = `v${version}`;
console.log(`▶ Releasing Playbook ${tag} (Mac arm64)`);

// 2. Confirm tag does not already exist on remote
const existingTags = out("git", ["ls-remote", "--tags", "origin"], {
  cwd: resolve(APP_DIR, "../.."),
});
if (existingTags.includes(`refs/tags/${tag}`)) {
  fail(
    `Tag ${tag} already exists on origin. Bump apps/desktop/package.json version and try again.`
  );
}

// 3. Build the renderer/main/preload bundles
run("pnpm", ["build"]);

// 4. Build dmg + zip and publish to GitHub Releases
run("pnpm", ["exec", "electron-builder", "--mac", "--arm64", "--publish", "always"], {
  env: { ...process.env, GH_TOKEN: token },
});

console.log(`\n✔ Released ${tag}`);
console.log(
  `  https://github.com/DiegoPinochet/playbook/releases/tag/${tag}`
);
console.log(`\nNext: bump apps/desktop/package.json before the next release.`);
