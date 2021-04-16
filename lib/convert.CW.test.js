/*
 Tests for the CW conversion / cleaning script. Each test corresponds to an entry in the test database. The \test field in the entry must be the same as the title of the test.
*/

import { EOL }           from 'os';
import convert           from './convert.CW.js';
import { expect }        from 'chai';
import { fileURLToPath } from 'url';
import getTestEntry      from '../test/getTestEntry.js';

import {
  readFile,
  unlink as removeFile,
} from 'fs/promises';

import {
  dirname as getDirname,
  join    as joinPaths,
} from 'path';

const __dirname  = getDirname(fileURLToPath(import.meta.url));
const inputPath  = joinPaths(__dirname, '../test/CW.test.db');
const outputPath = joinPaths(__dirname, '../test/CW.test.json');

describe('CW conversion script', () => {

  before(async function convertTestData() {
    this.data = await convert(inputPath, outputPath);
  });

  after(async function deleteConvertedTestData() {
    await removeFile(outputPath);
  });

  context('output', function() {

    it('returns an Array of entries', function() {
      expect(this.data).to.be.an('Array');
    });

    it('writes an NDJSON file', async function() {

      const text  = await readFile(outputPath, 'utf8');
      const lines = text.split(EOL).filter(Boolean);

      for (const line of lines) {
        expect(() => JSON.parse(line)).not.to.throw();
      }

    });

  });

  context('key', function() {

    it('assigns homograph numbers', function() {

      const entries = this.data;

      const homographA = entries.find(({ key }) => key === 'kakito1');
      const homographB = entries.find(({ key }) => key === 'kakito2');

      expect(homographA.lemma.sro).to.equal('kâkito');
      expect(homographB.lemma.sro).to.equal('kâkito');

    });

    it('assigns keys to each entry', function() {

      // Note: Only test entries with "lemma" fields are checked.
      const entries   = this.data.filter(({ lemma }) => lemma?.sro);
      const keyRegExp = /^[_eioaptkcmnshwy0-9]+$/u;
      // should be stripped of leading / trailing hyphens
      // should replace whitespace with underscores
      // should use ASCII characters only

      entries.forEach(({ key }) => {
        expect(key).to.match(keyRegExp);
      });

    });

  });

  context('\\def', function() {

    it('copies the original definition field verbatim', function() {
      const { definition } = getTestEntry(this.data, this.test.title);
      expect(definition).to.equal('North Star, Polaris; [lit: "star that does not move"]');
    });

    it('extracts compare relations: [cf. XXX]', function() {

      const {
        lexicalRelations: [crossRef],
        senses:           [sense],
      } = getTestEntry(this.data, this.test.title);

      expect(crossRef.key).to.equal('nama');
      expect(crossRef.lemma.sro).to.equal('nama');
      expect(crossRef.relation).to.equal('compare');
      expect(sense.definition).to.equal('not');

    });

    it('extracts cross-references: [see XXX]', function() {

      const {
        lexicalRelations: [crossRef],
        senses:           [sense],
      } = getTestEntry(this.data, this.test.title);

      expect(crossRef.key).to.equal('yikate');
      expect(crossRef.lemma.sro).to.equal('yîkatê-');
      expect(crossRef.relation).to.equal('crossReference');
      expect(sense.definition).to.equal('aside, off to one side');

    });

    it('extracts extended cross-references as notes: [see XXX …]', function() {

      const {
        notes:  [note],
        senses: [senseA, senseB],
      } = getTestEntry(this.data, this.test.title);

      expect(note.noteType).to.equal('general');
      expect(note.text).to.equal('see kakwâýaki- for further derivatives');
      expect(senseA.definition).to.equal('greatly, extremely, overwhelmingly, tremendously, to an extraordinary extent');
      expect(senseB.definition).to.equal('with startled surprise');

    });

    it('extracts general notes', function() {

      const { notes: [note] } = getTestEntry(this.data, this.test.title);

      expect(note.noteType).to.equal('general');
      expect(note.text).to.equal('i.e. foregone conclusion that something is not the case');

    });

    it('extracts Latin terms', function() {
      const { senses: [sense] } = getTestEntry(this.data, this.test.title);
      expect(sense.scientificName).to.equal('Fraximus nigra');
    });

    it('extracts multiple notes from a parenthetical', function() {

      const { literalMeaning, senses: [sense] } = getTestEntry(this.data, this.test.title);

      expect(literalMeaning).to.equal('yellow-root');
      expect(sense.scientificName).to.equal('Rumex sp.');

    });

    it('extracts multiple parentheticals', function() {

      const { senses: [senseA, senseB] } = getTestEntry(this.data, this.test.title);

      const { notes: [note] } = senseA;

      expect(note.noteType).to.equal('general');
      expect(note.text).to.equal('male name');

      const { usages } = senseB;

      expect(usages).to.have.lengthOf(1);
      expect(usages[0]).to.equal('plural');

    });

    it('extracts unbracketed literal definitions', function() {
      const { literalMeaning, senses } = getTestEntry(this.data, this.test.title);
      expect(literalMeaning).to.equal('God-day moon, Christmas moon');
      expect(senses).to.have.lengthOf(2);
    });

    it('extracts usage notes', function() {

      const { senses: [, sense] } = getTestEntry(this.data, this.test.title);

      expect(sense.usages).to.include('in negative clauses');
      expect(sense.definition).to.equal('(not) necessarily');

    });

    it('separates definitions by semicolons', function() {

      const { senses: [senseA, senseB] } = getTestEntry(this.data, this.test.title);

      expect(senseA.definition).to.equal('it is a star');
      expect(senseB.definition).to.equal('s/he is a star (e.g. in movies, sports, music, etc.)');

    });

  });

  context('\\dl', function() {

    it('combines multiple dialect codes', function() {
      const { dialects } = getTestEntry(this.data, this.test.title);
      expect(dialects).to.eql(['plai1258', 'swam1239']);
    });

    it('converts dialects to Glottocodes', function() {
      const { dialects } = getTestEntry(this.data, this.test.title);
      expect(dialects).to.eql(['nort2960']);
    });

  });

  context('\\sro', function() {

    it('copies the SRO field verbatim', function() {
      const { lemma } = getTestEntry(this.data, this.test.title);
      expect(lemma.sro).to.equal('acicipaýihow');
    });

  });

  context('\\syl', () => {

    it('copies the Syllabics field verbatim', function() {
      const { lemma } = getTestEntry(this.data, this.test.title);
      expect(lemma.syll).to.equal('ᐊᒑᐦᑯᐢ  ᐁᑳ  ᑳ ᐋᐦᒌᐟ');
    });

  });

});
