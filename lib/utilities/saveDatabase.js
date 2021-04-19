import { stringify as createJSONStream } from 'ndjson';
import { createWriteStream }             from 'fs';

/**
 * Writes an Array of Objects to an NDJSON file.
 * @param {String}  outputDir The directory where the NDJSON data should be written. The filename will be `database-{hash}.ndjson`.
 * @param {Array}   entries   The Array of entries to write to the file.
 */
export default function saveDatabase(outputPath, entries) {
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

  });
}
