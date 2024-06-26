import { glob } from "npm:glob@10.4.2";
import * as path from "https://deno.land/std@0.224.0/path/mod.ts";
import Semaphore from "npm:@chriscdn/promise-semaphore";
import { readJson, writeJson } from "https://deno.land/x/jsonfile@1.0.0/mod.ts";
import { encodeHex } from "jsr:@std/encoding/hex";
import { crypto } from "jsr:@std/crypto";

const semaphore = new Semaphore(2);

const md5File = async (filePath: string): Promise<string> => {
  const file = await Deno.open(filePath, { read: true });
  const readableStream = file.readable;
  const fileHashBuffer = await crypto.subtle.digest("SHA-256", readableStream);
  const fileHash = encodeHex(fileHashBuffer);
  return fileHash;
};

const importMediaFromSDCard = async (
  dbFile: string,
  sourceGlobs: Array<string>,
  targetPath: string,
) => {
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
};

export { importMediaFromSDCard };
