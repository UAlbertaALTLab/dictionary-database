/*
 Tests for the MD conversion / cleaning script. Each test corresponds to an entry in the test database. The value of the "test" field in the entry must be the same as the title of the test.
*/

/* eslint-disable
  camelcase,
*/

import convert           from './convert.MD.js';
import { expect }        from 'chai';
import { fileURLToPath } from 'url';
import getTestEntry      from '../test/getTestEntry.js';
import loadEntries       from './loadEntries.js';

import {
  dirname as getDirname,
  join    as joinPaths,
} from 'path';

const __dirname    = getDirname(fileURLToPath(import.meta.url));
const testDataPath = joinPaths(__dirname, `../test/MD.test.tsv`);
const outPath      = joinPaths(__dirname, `../test/MD.test.json`);

describe(`MD conversion script`, () => {

  before(async function convertTestData() {
    await convert(testDataPath, outPath);
    this.data = await loadEntries(outPath);
  });

  context(`English_POS`, function() {
    it(`copies the English_POS field verbatim`, function() {
      const { English_POS } = getTestEntry(this.data, this.test.title);
      expect(English_POS).to.equal(`he_PRON_SUBJ sees#see_V him#he_PRON ._`);
    });
  });

  context(`English_Search`, function() {
    it(`copies the English_Search field verbatim`, function() {
      const { English_Search } = getTestEntry(this.data, this.test.title);
      expect(English_Search).to.equal(`see him.`);
    });
  });

  context(`MeaningInEnglish`, function() {

    it(`determines animacy: animate`, function() {
      const entry = getTestEntry(this.data, this.test.title);
      expect(entry.features.animate).to.be.true;
    });

    it(`determines animacy: inanimate`, function() {
      const entry = getTestEntry(this.data, this.test.title);
      expect(entry.features.animate).to.be.false;
    });

    it(`removes basic animacy descriptions from the definition`, function() {
      const entry = getTestEntry(this.data, this.test.title);
      const { senses:[sense] } = entry;
      expect(sense.definition).to.equal(`He strains him.`);
    });

    it(`removes parenthetical animacy descriptions from the definition`, function() {
      const entry               = getTestEntry(this.data, this.test.title);
      const { senses: [sense] } = entry;
      expect(sense.definition).to.equal(`He attaches it like so.`);
    });

    it(`separates multiple senses`, function() {
      const { senses } = getTestEntry(this.data, this.test.title);
      const [senseA, senseB] = senses;
      expect(senseA.definition).to.equal(`A Sioux Indian.`);
      expect(senseB.definition).to.equal(`A male pow-wow dancer.`);
    });

    it(`separates multiple senses for homographs`, function() {
      const { senses } = getTestEntry(this.data, this.test.title);
      const [senseA, senseB] = senses;
      expect(senseA.definition).to.equal(`The Sioux Indians.`);
      expect(senseB.definition).to.equal(`Male pow-wow dancers.`);
    });

    it(`stores the original definition on the entry`, function() {
      const entry = getTestEntry(this.data, this.test.title);
      expect(entry.definition).to.equal(`He sees him.`);
    });

  });

  context(`POS`, function() {
    it(`copies the POS field verbatim`, function() {
      const { senses: [sense] } = getTestEntry(this.data, this.test.title);
      expect(sense.category).to.equal(`vp`);
    });
  });

  context(`RapidWordIndices`, function() {

    it(`stores the original RapidWordIndices on the entry`, function() {
      const { RapidWordIndices } = getTestEntry(this.data, this.test.title);
      expect(RapidWordIndices).to.equal(`2.3.1; 2.3`);
    });

    it(`stores Rapid Words indices in Sense.semanticIndices`, function() {
      const { senses: [sense] } = getTestEntry(this.data, this.test.title);
      const { semanticIndices } = sense;
      expect(semanticIndices).to.have.lengthOf(2);
      expect(semanticIndices).to.include(`2.3.1`);
      expect(semanticIndices).to.include(`2.3`);
    });

  });

  context(`RapidWordsClasses`, function() {

    it(`stores Rapid Words classes in Sense.semanticDomains`, function() {
      const { senses: [sense] } = getTestEntry(this.data, this.test.title);
      const { semanticDomains } = sense;
      expect(semanticDomains).to.have.lengthOf(2);
      expect(semanticDomains).to.include(`see`);
      expect(semanticDomains).to.include(`sense_perceive`);
    });

    it(`stores the original RapidWordsClasses on the entry`, function() {
      const { RapidWordsClasses } = getTestEntry(this.data, this.test.title);
      expect(RapidWordsClasses).to.equal(`see; sense_perceive`);
    });

  });

  context(`SRO`, function() {
    it(`copies the SRO field verbatim`, function() {
      const { lemma: { sro } } = getTestEntry(this.data, this.test.title);
      expect(sro).to.equal(`wapimew`);
    });
  });

  context(`Syllabics`, function() {
    it(`copies the Syllabics field verbatim`, function() {
      const { lemma: { syllabics } } = getTestEntry(this.data, this.test.title);
      expect(syllabics).to.equal(`ᐊᐧᐱᒣᐤ`);
    });
  });

});