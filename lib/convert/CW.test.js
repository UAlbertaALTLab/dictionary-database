/*
 Tests for the CW conversion script. Each test corresponds to an entry in the test database. The \test field in the entry must be the same as the title of the test.
*/

import convert           from './CW.js';
import { EOL }           from 'os';
import { expect }        from 'chai';
import { fileURLToPath } from 'url';
import fs                from 'fs-extra';
import getTestEntry      from '../../test/getTestEntry.js';

const {
  readFile,
  remove,
} = fs;

import {
  dirname as getDirname,
  join    as joinPaths,
} from 'path';

const __dirname  = getDirname(fileURLToPath(import.meta.url));
const inputPath  = joinPaths(__dirname, `../../test/CW.test.db`);
const outputPath = joinPaths(__dirname, `../../test/CW.test.ndjson`);

describe(`CW conversion script`, () => {

  before(async function convertTestData() {
    this.data = await convert(inputPath, outputPath);
  });

  after(async function deleteConvertedTestData() {
    await remove(outputPath);
  });

  context(`output`, function() {

    it(`returns an Array of entries`, function() {
      expect(this.data).to.be.an(`Array`);
    });

    it(`writes an NDJSON file`, async function() {

      const text  = await readFile(outputPath, `utf8`);
      const lines = text.split(EOL).filter(Boolean);

      for (const line of lines) {
        expect(() => JSON.parse(line)).not.to.throw();
      }

    });

  });

});
