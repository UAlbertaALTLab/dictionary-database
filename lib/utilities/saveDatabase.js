import createHash                        from 'object-hash';
import { stringify as createJSONStream } from 'ndjson';
import { createWriteStream }             from 'fs';

import {
  basename as getBasename,
  dirname  as getDirname,
  extname  as getExtname,
  join     as joinPath,
} from 'path';

/**
 * Writes the entries Array to a JSON file.
 * @param {String} outputPath The path where the JSON data should be written.
 * @param {Array}  entries    The Array of entries to write to the file.
 */
export default function saveDatabase(outputPath, entries) {
  return new Promise((resolve, reject) => {

    const ext         = getExtname(outputPath);
    const filename    = getBasename(outputPath, ext);
    const dir         = getDirname(outputPath);
    const hash        = createHash(entries);
    const hashPath    = joinPath(dir, `${ filename }-${ hash }${ ext }`);

    const jsonStream  = createJSONStream();
    const writeStream = createWriteStream(hashPath);

    jsonStream.on('error', reject);
    writeStream.on('finish', resolve);
    writeStream.on('close', resolve);
    writeStream.on('error', reject);

    jsonStream.pipe(writeStream);

    entries.forEach(entry => jsonStream.write(entry));

    jsonStream.end();

  });
}
