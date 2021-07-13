import createTSVStream      from 'csv-stringify';
import { createWriteStream } from 'fs';

export default function writeTSV(outputPath, data, options) {
  return new Promise((resolve, reject) => {

    const writeSteam = createWriteStream(outputPath);
    const tsvStream  = createTSVStream(options);

    tsvStream.on(`error`, reject);
    writeSteam.on(`error`, reject);
    writeSteam.on(`close`, resolve);
    writeSteam.on(`finish`, resolve);

    tsvStream.pipe(writeSteam);

    for (const item of data) {
      tsvStream.write(Object.values(item));
    }

    tsvStream.end();

  });
}
