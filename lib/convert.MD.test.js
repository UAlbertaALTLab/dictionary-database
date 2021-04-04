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

  // TODO: remove this test when you've written your first real one for this suite
  it.only(`loads data`, function() {
    expect(this.data).to.be.an(`array`);
    expect(this.data).to.have.lengthOf(100);
  });

});
