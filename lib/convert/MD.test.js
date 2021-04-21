/*
 Tests for the MD conversion / cleaning script. Each test corresponds to an entry in the test database. The value of the "test" field in the entry must be the same as the title of the test. Note that each test entry in the database MUST have a unique key (defined as lemma + definition).
*/

import { EOL }           from 'os';
import convert           from './MD.js';
import { expect }        from 'chai';
import { fileURLToPath } from 'url';
import getTestEntry      from '../../test/getTestEntry.js';

import {
  readFile,
  unlink as removeFile,
} from 'fs/promises';

import {
  dirname as getDirname,
  join    as joinPaths,
} from 'path';


describe('MD conversion script', () => {

  const __dirname    = getDirname(fileURLToPath(import.meta.url));
  const inputPath    = joinPaths(__dirname, '../../test/MD.test.tsv');
  const outputPath   = joinPaths(__dirname, '../../test/MD.test.ndjson');
  const mappingsPath = joinPaths(__dirname, '../../data/MD-CW-mappings.tsv');

  before(async function convertTestData() {
    this.data = await convert(inputPath, outputPath, null /* mappingsPath */, { silent: true });
  });

  after(async function removeConvertedTestData() {
    try {
      await removeFile(outputPath);
    } catch {
      // do nothing
    }
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

  context('English_POS', function() {
    it('copies the English_POS field verbatim', function() {
      const { English_POS } = getTestEntry(this.data, this.test.title);
      expect(English_POS).to.equal('he_PRON_SUBJ counts#count_V them#they_PRON (_ those_DET people#people_N )_ ._');
    });
  });

  context('English_Search', function() {
    it('copies the English_Search field verbatim', function() {
      const { English_Search } = getTestEntry(this.data, this.test.title);
      expect(English_Search).to.equal('be counted.');
    });
  });

  // These tests can only be run when the mappings file is present.
  // The mappings file should never be checked into git.
  context('mapping', function() {
    it.skip('adds a mapping to a CW entry', function() {
      const { mapping } = getTestEntry(this.data, this.test.title);
      expect(mapping.lemma_CW).to.equal('akâmihk');
      expect(mapping.definition_CW).to.equal('across, on the far side; across (water or land)');
      expect(mapping.matchType).to.equal('dialect');
      expect(mapping.fstStem).to.equal('akâmihk+Ipc');
    });
  });

  context('MeaningInEnglish', function() {

    it('determines animacy: animate', function() {
      const entry = getTestEntry(this.data, this.test.title);
      expect(entry.features.animate).to.be.true;
    });

    it('determines animacy: inanimate', function() {
      const entry = getTestEntry(this.data, this.test.title);
      expect(entry.features.animate).to.be.false;
    });

    it('removes basic animacy descriptions from the definition', function() {
      const entry = getTestEntry(this.data, this.test.title);
      const { senses:[sense] } = entry;
      expect(sense.definition).to.equal('He strains him.');
    });

    it('removes parenthetical animacy descriptions from the definition', function() {
      const { senses: [sense] } = getTestEntry(this.data, this.test.title);
      expect(sense.definition).to.equal('He attaches it like so.');
    });

    it('separates multiple senses', function() {
      const { senses } = getTestEntry(this.data, this.test.title);
      const [senseA, senseB] = senses;
      expect(senseA.definition).to.equal('A Sioux Indian.');
      expect(senseB.definition).to.equal('A male pow-wow dancer.');
    });

    it('separates multiple senses for homographs', function() {
      const { senses } = getTestEntry(this.data, this.test.title);
      const [senseA, senseB] = senses;
      expect(senseA.definition).to.equal('The Sioux Indians.');
      expect(senseB.definition).to.equal('Male pow-wow dancers.');
    });

    it('stores the original definition on the entry', function() {
      const entry = getTestEntry(this.data, this.test.title);
      expect(entry.definition).to.equal('It is at a different place. 2. Means that dates and/or events have been changed to a different time or place.');
    });

  });

  context('POS', function() {
    it('copies the POS field verbatim', function() {
      const { senses: [sense] } = getTestEntry(this.data, this.test.title);
      expect(sense.category).to.equal('v phrase');
    });
  });

  context('RapidWordIndices', function() {

    it('stores the original RapidWordIndices on the entry', function() {
      const { RapidWordIndices } = getTestEntry(this.data, this.test.title);
      expect(RapidWordIndices).to.equal('2.3.1; 2.3');
    });

    it('stores Rapid Words indices in Sense.semanticIndices', function() {
      const { senses: [sense] } = getTestEntry(this.data, this.test.title);
      const { semanticIndices } = sense;
      expect(semanticIndices).to.have.lengthOf(3);
      expect(semanticIndices).to.include('3.5');
      expect(semanticIndices).to.include('4.2');
      expect(semanticIndices).to.include('3.5.4');
    });

  });

  context('RapidWordsClasses', function() {

    it('stores Rapid Words classes in Sense.semanticDomains', function() {
      const { senses: [sense] } = getTestEntry(this.data, this.test.title);
      const { semanticDomains } = sense;
      expect(semanticDomains).to.have.lengthOf(3);
      expect(semanticDomains).to.include('communication');
      expect(semanticDomains).to.include('social_activity');
      expect(semanticDomains).to.include('story');
    });

    it('stores the original RapidWordsClasses on the entry', function() {
      const { RapidWordsClasses } = getTestEntry(this.data, this.test.title);
      expect(RapidWordsClasses).to.equal('communication; describe; story');
    });

  });

  context('SRO', function() {
    it('copies the SRO field verbatim', function() {
      const { lemma: { md } } = getTestEntry(this.data, this.test.title);
      expect(md).to.equal('achihtin');
    });
  });

  context('Syllabics', function() {
    it('copies the Syllabics field verbatim', function() {
      const { lemma: { syllabics } } = getTestEntry(this.data, this.test.title);
      expect(syllabics).to.equal('ᐊᒐᐦᑯᐢ');
    });
  });

});
