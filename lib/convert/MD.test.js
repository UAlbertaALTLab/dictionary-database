/**
 * Tests for the MD conversion script. Each test corresponds to an entry in the test database. The value of the "test" field in the entry must be the same as the title of the test.
 */

import convert           from './MD.js';
import { expect }        from 'chai';
import { fileURLToPath } from 'url';
import fs                from 'fs-extra';
import getTestEntry      from '../../test/getTestEntry.js';

import {
  dirname as getDirname,
  join    as joinPaths,
} from 'path';

const {
  readFile,
  remove,
} = fs;

describe(`MD conversion script`, function() {

  const __dirname    = getDirname(fileURLToPath(import.meta.url));
  const inputPath    = joinPaths(__dirname, `../../test/MD.test.tsv`);
  const outputPath   = joinPaths(__dirname, `../../test/MD.test.ndjson`);

  before(async function convertTestData() {

    const { entries, errors } = await convert(inputPath, outputPath);

    this.data   = entries;
    this.errors = errors;

  });

  after(async function removeTestData() {
    await remove(outputPath);
  });

  context(`entries`, function() {
    it(`acâhkos`, function() {
      const entry = getTestEntry(this.data, this.test.title);
      expect(entry.head.md).to.equal(`achahkos`);
      expect(entry.head.syll).to.equal(`ᐊᒐᐦᑯᐢ`);
      expect(entry.lemma.md).to.equal(`achahkos`);
      expect(entry.lemma.syll).to.equal(`ᐊᒐᐦᑯᐢ`);
      expect(entry.pos).to.equal(`N`);
    });
  });

  context(`head`, function() {
    it(`retains punctuation`, function() {
      const entry = getTestEntry(this.data, this.test.title);
      expect(entry.head.md).to.equal(`awinana?`);
      expect(entry.head.syll).to.equal(`ᐊᐃᐧᓇᓇ?`);
    });
  });

  context(`lemma`, function() {
    it(`strips punctuation`, function() {
      const entry = getTestEntry(this.data, this.test.title);
      expect(entry.lemma.md).to.equal(`awinana`);
      expect(entry.lemma.syll).to.equal(`ᐊᐃᐧᓇᓇ`);
    });
  });

  context(`output`, function() {

    it(`returns an Array of entries`, function() {
      expect(this.data).to.be.an(`Array`);
    });

    it(`writes an NDJSON file`, async function() {

      const text  = await readFile(outputPath, `utf8`);
      const lines = text.split(`\n`).filter(Boolean);

      for (const line of lines) {
        expect(() => JSON.parse(line)).not.to.throw();
      }

    });

  });

});
