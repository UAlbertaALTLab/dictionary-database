/*
 Tests for the CW conversion / cleaning script.
*/

import convert           from './convert.CW.js';
import { expect }        from 'chai';
import { fileURLToPath } from 'url';
import loadEntries       from './loadEntries.js';

import {
  dirname as getDirname,
  join    as joinPaths,
} from 'path';

const __dirname    = getDirname(fileURLToPath(import.meta.url));
const testDataPath = joinPaths(__dirname, `../test/CW.test.db`);
const outPath      = joinPaths(__dirname, `../test/CW.test.json`);

/**
 * Finds the first entry in the test database whose \test field matches the test description
 * @param  {Object} ctx The Mocha test context
 * @return {Object}     Returns the relevant test entry
 */
function getTestEntry(ctx) {
  const matchedEntry = ctx.data.filter(entry => entry.test === ctx.test.title).shift();
  if (!matchedEntry) expect.fail(`No test database entry found for test "${ ctx.test.title }"`);
  return matchedEntry;
}

describe(`CW conversion script`, function() {

  before(async function convertTestData() {
    await convert(testDataPath, outPath);
    this.data = await loadEntries(outPath);
  });

  context(`\\def`, function() {

    it(`copies the original definition field verbatim`, function() {
      const { definition } = getTestEntry(this);
      expect(definition).to.equal(`North Star, Polaris; [lit: "star that does not move"]`);
    });

    it(`extracts compare relations: [cf. XXX]`, function() {

      const {
        lexicalRelations: [crossRef],
        senses:           [sense],
      } = getTestEntry(this);

      expect(crossRef.key).to.equal(`nama`);
      expect(crossRef.lemma.sro).to.equal(`nama`);
      expect(crossRef.relation).to.equal(`compare`);
      expect(sense.definition).to.equal(`not`);

    });

    it(`extracts cross-references: [see XXX]`, function() {

      const {
        lexicalRelations: [crossRef],
        senses:           [sense],
      } = getTestEntry(this);

      expect(crossRef.key).to.equal(`yikate`);
      expect(crossRef.lemma.sro).to.equal(`yîkatê-`);
      expect(crossRef.relation).to.equal(`crossReference`);
      expect(sense.definition).to.equal(`aside, off to one side`);

    });

    it(`extracts extended cross-references as notes: [see XXX …]`, function() {

      const {
        notes:  [note],
        senses: [senseA, senseB],
      } = getTestEntry(this);

      expect(note.noteType).to.equal(`general`);
      expect(note.text).to.equal(`see kakwâýaki- for further derivatives`);
      expect(senseA.definition).to.equal(`greatly, extremely, overwhelmingly, tremendously, to an extraordinary extent`);
      expect(senseB.definition).to.equal(`with startled surprise`);

    });

    it(`extracts general notes`, function() {

      const { notes: [note] } = getTestEntry(this);

      expect(note.noteType).to.equal(`general`);
      expect(note.text).to.equal(`i.e. foregone conclusion that something is not the case`);

    });

    it(`extracts Latin terms`, function() {
      const { senses: [sense] } = getTestEntry(this);
      expect(sense.scientificName).to.equal(`Fraximus nigra`);
    });

    it(`extracts multiple notes from a parenthetical`, function() {

      const { literalMeaning, senses: [sense] } = getTestEntry(this);

      expect(literalMeaning).to.equal(`yellow-root`);
      expect(sense.scientificName).to.equal(`Rumex sp.`);

    });

    it(`extracts multiple parentheticals`, function() {

      const { senses: [senseA, senseB] } = getTestEntry(this);

      const { notes: [note] } = senseA;

      expect(note.noteType).to.equal(`general`);
      expect(note.text).to.equal(`male name`);

      const { usages } = senseB;

      expect(usages).to.have.lengthOf(1);
      expect(usages[0]).to.equal(`plural`);

    });

    it(`extracts unbracketed literal definitions`, function() {
      const { literalMeaning, senses } = getTestEntry(this);
      expect(literalMeaning).to.equal(`God-day moon, Christmas moon`);
      expect(senses).to.have.lengthOf(2);
    });

    it(`extracts usage notes`, function() {

      const { senses: [, sense] } = getTestEntry(this);

      expect(sense.usages).to.include(`in negative clauses`);
      expect(sense.definition).to.equal(`(not) necessarily`);

    });

    it(`separates definitions by semicolons`, function() {

      const { senses: [senseA, senseB] } = getTestEntry(this);

      expect(senseA.definition).to.equal(`it is a star`);
      expect(senseB.definition).to.equal(`s/he is a star (e.g. in movies, sports, music, etc.)`);

    });

  });

  context(`\\dl`, function() {

    it(`combines multiple dialect codes`, function() {
      const { dialects } = getTestEntry(this);
      expect(dialects).to.eql([`plai1258`, `swam1239`]);
    });

    it(`converts dialects to Glottocodes`, function() {
      const { dialects } = getTestEntry(this);
      expect(dialects).to.eql([`nort2960`]);
    });

  });

  context(`\\sro`, function() {

    it(`copies the SRO field verbatim`, function() {
      const { lemma } = getTestEntry(this);
      expect(lemma.sro).to.equal(`acicipaýihow`);
    });

  });

  context(`\\syl`, function() {

    it(`copies the Syllabics field verbatim`, function() {
      const { lemma } = getTestEntry(this);
      expect(lemma.syll).to.equal(`ᐊᒑᐦᑯᐢ  ᐁᑳ  ᑳ ᐋᐦᒌᐟ`);
    });

  });

  context(`key`, function() {

    it(`assigns homograph numbers`, function() {

      const entries = this.data;

      const homographA = entries.find(({ key }) => key === `kakito`);
      const homographB = entries.find(({ key }) => key === `kakito2`);

      expect(homographA.lemma.sro).to.equal(`kâkito`);
      expect(homographB.lemma.sro).to.equal(`kâkito`);

    });

    it(`assigns keys to each entry`, function() {

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

});
