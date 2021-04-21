/* eslint-disable
  max-statements,
*/

import { stringify as createJSONStream } from 'ndjson';
import { createWriteStream }             from 'fs';

/**
 * Writes an Array of Objects to an NDJSON file.
 * @param {String}  outputDir The directory where the NDJSON data should be written. The filename will be `database-{hash}.ndjson`.
 * @param {Array}   entries   The Array of entries to write to the file.
 */
export default function saveDatabase(outputPath, entries, { silent = false } = {}) {
  return new Promise((resolve, reject) => {

    const jsonStream  = createJSONStream();
    const writeStream = createWriteStream(outputPath);

    jsonStream.on('error', reject);
    writeStream.on('finish', resolve);
    writeStream.on('close', resolve);
    writeStream.on('error', reject);

    jsonStream.pipe(writeStream);

    entries.forEach(entry => jsonStream.write(entry));

    jsonStream.end();

    if (!silent) {

      const noHomographNumber = entries.filter(entry => !/[0-9]$/u.test(entry.key)).length;

      const info = {
        noHomographNumber,
      };

      let homographNum = 2;
      let homographs   = entries.filter(entry => entry.key.endsWith(homographNum)).length;

      while (homographs) {
        info[`homograph${ homographNum }`] = homographs;
        homographNum++;
        homographs = entries.filter(entry => entry.key.endsWith(homographNum)).length;
      }

      console.table(info);

    }

  });
}
