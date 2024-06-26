#!/usr/bin/env -S deno run --allow-read --allow-write --unstable

import importMediaFromSDCard from "https://raw.githubusercontent.com/chriscdn/sd-card-import/main/main.ts?v=9";

const dbFile = "/Users/chris/.import-sd-card/db.test.json";

const sourceGlobs = [
  "/Volumes/CANON_DC/**/*.{JPG,MOV,CR2}",
  "/Volumes/Untitled/**/*.{RAF,MOV,NEF}",
  "/Volumes/Untitled 1/**/*.{RAF,MOV,NEF}",
  "/Volumes/NO NAME/**/*.{RAF,MOV,NEF}",
  "/Volumes/NIKON D7100/**/*.{RAF,MOV,NEF}",
];

// const targetPath = "/Users/chris/Pictures/Lightroom/Camera Uploads/";
const targetPath = "/Users/chris/Pictures/Lightroom/Camera Uploads/";

const results = await importMediaFromSDCard(dbFile, sourceGlobs, targetPath);

console.log(results);
