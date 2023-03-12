/**
 * Should be updated..
 */
import { createHash } from "https://deno.land/std@0.160.0/hash/mod.ts";
import { iterateReader } from "https://deno.land/std@0.179.0/streams/iterate_reader.ts";

async function md5File(filePath: string): Promise<string> {
  const hash = createHash("md5");
  const file = await Deno.open(filePath);

  for await (const chunk of iterateReader(file)) {
    hash.update(chunk);
  }

  Deno.close(file.rid);

  return hash.toString();
}

export default md5File;

// if (import.meta.main) {
//   const md5 = await md5File(
//   );
//   console.log(md5);
// }
