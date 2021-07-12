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

    const { entries, errors } = await convert(inputPath, outputPath);

    this.data   = entries;
    this.errors = errors;

  });

  after(async function deleteConvertedTestData() {
    await remove(outputPath);
  });

  context(`entry`, function() {

    // NOTE: There are no entries with multiple \ps but just one definition.

    it(`splits entries with multiple definitions`, function() {

      const penEntry = this.data.find(
        entry => entry.lemma.sro === `masinahikanâpisk`
        && entry.senses[0].definition === `pen`,
      );

      const slateEntry = this.data.find(
        entry => entry.lemma.sro === `masinahikanâpisk`
        && entry.senses[0].definition === `slate`,
      );

      expect(penEntry).to.exist;
      expect(slateEntry).to.exist;

    });

    it(`splits entries with multiple POS + definition pairs`, function() {

      const ipjEntry = this.data.find(
        entry => entry.lemma.sro === `âmî`
        && entry.pos === `IPJ`,
      );

      const ipcEntry = this.data.find(
        entry => entry.lemma.sro === `âmî`
        && entry.pos === `IPC`,
      );

      expect(ipjEntry).to.exist;
      expect(ipcEntry).to.exist;

    });

    it(`returns a ParseError object when there are different numbers of definitions and POS codes`, function() {
      const parseError = this.errors.find(error => error.code === `NumDefMismatch` && error.sro === `âmî`);
      expect(parseError).to.exist;
    });

  });

  context(`head`, function() {
    it(`constructs the head`, function() {

      const { head }             = getTestEntry(this.data, this.test.title);
      const { proto, sro, syll } = head;

      expect(proto).to.equal(`awahêk!`);
      expect(sro).to.equal(`awahêk!`);
      expect(syll).to.equal(`ᐊᐊᐧᐦᐁ`);

    });
  });

  context(`lemma`, function() {

    it(`constructs the lemma`, function() {

      const { lemma }            = getTestEntry(this.data, this.test.title);
      const { proto, sro, syll } = lemma;

      expect(proto).to.equal(`acicipaýihow`);
      expect(sro).to.equal(`acicipayihow`);
      expect(syll).to.equal(`ᐊᒋᒋᐸᔨᐦᐅᐤ`);

    });

    it(`does not include punctuation`, function() {

      const { lemma }            = getTestEntry(this.data, this.test.title);
      const { proto, sro, syll } = lemma;

      expect(proto).to.equal(`awahêk`);
      expect(sro).to.equal(`awahêk`);
      expect(syll).to.equal(`ᐊᐊᐧᐦᐁ`);

    });

  });

  context(`original`, function() {
    it(`retains the text of the original Toolbox entry`, function() {
      let { original } = getTestEntry(this.data, this.test.title);
      original = original.replace(/\r\n/gu, `\n`);
      expect(original).to.equal(`\\test retains the text of the original Toolbox entry\n\\sro  original`);
    });
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
