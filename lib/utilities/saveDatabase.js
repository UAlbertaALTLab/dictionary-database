import { stringify as createJSONStream } from 'ndjson';
import { createWriteStream }             from 'fs';
import { join as joinPath }              from 'path';

/**
 * Writes an Array of Objects to an NDJSON file.
 * @param {String}  outputDir           The directory where the NDJSON data should be written. The filename will be `database-{hash}.ndjson`.
 * @param {Array}   entries             The Array of entries to write to the file.
 * @param {Object}  [options={}]        An options object.
 * @param {Boolean} [options.hash=true] Whether to add the hash to the output filename.
 */
export default async function saveDatabase(outputDir, entries, { hash = true } = {}) {

  let filename = `database`;

  // NOTE: Hashing the entire database is slow.
  // Setting `hash = false` significantly speeds up any scripts that rely on this one.
  if (hash) {
    const { sha1: createHash }  = await import('object-hash');
    const versionHash           = createHash(entries);
    filename                   += `-${ versionHash }`;
  }

  filename += `.ndjson`;

  return new Promise((resolve, reject) => {

    const jsonStream  = createJSONStream();
    const writeStream = createWriteStream(joinPath(outputDir, filename));

    jsonStream.on('error', reject);
    writeStream.on('finish', resolve);
    writeStream.on('close', resolve);
    writeStream.on('error', reject);

    jsonStream.pipe(writeStream);

    entries.forEach(entry => jsonStream.write(entry));

    jsonStream.end();

  });

}
