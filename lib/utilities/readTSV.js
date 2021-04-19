import createCSVStream      from 'csv-parse';
import { createReadStream } from 'fs';

/**
 * Reads the CSV file into an Array of JSON objects
 * @param  {String}         inputPath The path to the TSV file.
 * @return {Promise<Array>}           Resolves to an Array of Objects representing rows in the TSV.
 */
export default async function readCSV(inputPath, { columns = true } = {}) {

  const csvOptions = {
    columns,
    delimiter: '\t',
    relax:     true,
  };

  const readStream = createReadStream(inputPath);
  const csvStream  = createCSVStream(csvOptions);

  readStream.pipe(csvStream);

  const records = [];

  for await (const record of csvStream) {
    records.push(record);
  }

  return records;

}
