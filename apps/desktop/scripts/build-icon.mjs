#!/usr/bin/env node
import pngToIco from "png-to-ico";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, "..");
const SRC = resolve(APP_DIR, "build/icon.png");
const DEST = resolve(APP_DIR, "build/icon.ico");

const buffer = await pngToIco(SRC);
await writeFile(DEST, buffer);
console.log(`✔ Wrote ${DEST} (${buffer.length} bytes)`);
