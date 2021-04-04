import createCSVStream       from 'csv-parse';
import createTransformStream from 'stream-transform';
import ndjson                from 'ndjson';
import ProgressBar           from 'progress';

import {
  createReadStream,
  createWriteStream,
  promises as fsPromises,
} from 'fs';

const { stat } = fsPromises;

/**
 * The handler passed to the transform stream to transform data before passing it to the JSON stream for writing to the JSON file.
 * @param  {Object} data The raw CSV data, as an object (column headers are property names).
 * @return {Object}      Returns the modified data for writing to the JSON file.
 */
function transform(data) {
  return data;
}

export default async function convertCW(inputPath, outputPath) {

  // validate arguments
  if (!inputPath) {
    throw new Error(`Please provide the path to the Maskwacîs database as the first argument.`);
  }

  if (!outputPath) {
    throw new Error(`Please provide the path where you would like the converted file generated as the second argument`);
  }

  // create command line progress bar
  const { size: fileSize } = await stat(inputPath);
  const progressBar        = new ProgressBar(`:bar :percent :eta`, { total: fileSize });

  await new Promise((resolve, reject) => {

    // create streams
    const readStream      = createReadStream(inputPath);
    const csvStream       = createCSVStream({ columns: true, delimiter: `\t` });
    const transformStream = createTransformStream(transform);
    const jsonStream      = ndjson.stringify();
    const writeStream     = createWriteStream(outputPath);

    // subscribe to various stream events
    // NOTE: Stream errors are **not** forwarded to next stream in the pipe.
    readStream.on(`data`, chunk => progressBar.tick(chunk.length > fileSize ? fileSize : chunk.length));
    readStream.on(`error`, err => {
      console.error(`Error in read stream:`);
      reject(err);
    });
    csvStream.on(`error`, err => {
      console.error(`Error in CSV stream:`);
      reject(err);
    });
    jsonStream.on(`error`, err => {
      console.error(`Error in JSON stream:`);
      reject(err);
    });
    writeStream.on(`close`, () => {
      console.info(`Finished converting the Maskwacîs database.`);
      resolve();
    });
    writeStream.on(`error`, err => {
      console.error(`Error in write stream:`);
      reject(err);
    });

    // start the streams
    console.info(`Converting the Maskwacîs database.`);

    readStream
    .pipe(csvStream)
    .pipe(transformStream)
    .pipe(jsonStream)
    .pipe(writeStream);

  });

}
