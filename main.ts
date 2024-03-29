import { glob } from "npm:glob";
import * as path from "https://deno.land/std@0.170.0/path/mod.ts";
import Semaphore from "npm:@chriscdn/promise-semaphore";
import { readJson, writeJson } from "https://deno.land/x/jsonfile@1.0.0/mod.ts";
import md5File from "./md5File.ts";
const semaphore = new Semaphore(2);

async function importMediaFromSDCard(
  dbFile: string,
  sourceGlobs: Array<string>,
  targetPath: string
) {
  const md5s = (await readJson(dbFile).catch(() => [])) as Array<string>;

  const sources = sourceGlobs.map((sourceGlob) => glob.sync(sourceGlob)).flat();

  const results = {
    copied: 0,
    notcopied: 0,
    errors: 0,
  };

  console.log("\n");
  console.log(`Files found: ${sources.length}`);
  console.log("\n");

  const promises = sources.map(async (source) => {
    try {
      await semaphore.acquire();

      const hash0 = await md5File(source);
      const target = path.join(targetPath, path.basename(source));

      if (md5s.includes(hash0)) {
        console.log(`Already copied: ${source} → ${target}`);
        results.notcopied += 1;
      } else {
        await Deno.copyFile(source, target);

        const hash1 = await md5File(target);

        if (hash0 === hash1) {
          // add to beginnning of array
          md5s.unshift(hash0);

          console.log(`Copied: ${source} → ${target}`);
          results.copied += 1;
        } else {
          console.log(`*** MD5 Mismatch: ${source} → ${target}`);
          results.errors += 1;
        }
      }
    } finally {
      semaphore.release();
    }
  });

  await Promise.all(promises);

  // keep the first 5000
  md5s.splice(5000);

  await writeJson(dbFile, md5s);

  console.log(results);

  return results;
}

export default importMediaFromSDCard;
