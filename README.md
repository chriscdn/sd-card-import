# sd-card-import

This Deno script is for importing photos and videos from SD cards. It ensures the same file is not imported twice by keeping a hash of each imported photo, and not importing photos that have already been imported.

## Usage

Create a shell script as follows:

```js
#!/usr/bin/env -S deno run --allow-read --allow-write --unstable

import importMediaFromSDCard from "https://raw.githubusercontent.com/chriscdn/sd-card-import/main/main.ts?v=2";

// A writeable location to store the hash codes.
const dbFile = "/Users/chris/.import-sd-card/db.test.json";

// A list of globs to search for media.
const sourceGlobs = [
  "/Volumes/CANON_DC/**/*.{JPG,MOV,CR2}",
  "/Volumes/Untitled/**/*.{RAF,MOV,NEF}",
  "/Volumes/Untitled 1/**/*.{RAF,MOV,NEF}",
  "/Volumes/NO NAME/**/*.{RAF,MOV,NEF}",
  "/Volumes/NIKON D7100/**/*.{RAF,MOV,NEF}",
];

// Where to copy the files.
const targetPath = "/Users/me/Pictures/Lightroom/Camera Uploads/";

const results = await importMediaFromSDCard(dbFile, sourceGlobs, targetPath);

console.log(results);
```
