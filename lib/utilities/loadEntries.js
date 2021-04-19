/**
 * Loads all the entries in an NDJSON file into memory.
 */

import fs     from 'fs';
import ndjson from 'ndjson';

/**
 * Loads all the entries from an NDJSON file into memory.
 * @param  {String}         dataPath The path to the file containing the NDJSON records.
 * @return {Promise<Array>}          Returns a Promise that resolves to an Array of the entries.
 */
export default function loadEntries(dataPath) {
  return new Promise((resolve, reject) => {

    const entries = [];

    fs.createReadStream(dataPath)
    .pipe(ndjson.parse())
    .on('data', entry => entries.push(entry))
    .on('end', () => resolve(entries))
    .on('error', error => reject(error));

  });
}
