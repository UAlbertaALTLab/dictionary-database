// This file contains data integrity tests for the CW Toolbox database (Wolvengrey.toolbox).

import createSpinner     from 'ora';
import { expect }        from 'chai';
import { fileURLToPath } from 'url';
import { promises }      from 'fs';

import {
  dirname as getDirname,
  join    as joinPath,
} from 'path';

const __dirname    = getDirname(fileURLToPath(import.meta.url));
const { readFile } = promises;

describe('Toolbox database', function() {

  before(async function() {
    const databasePath = joinPath(__dirname, '../data/Wolvengrey.toolbox');
    this.text = await readFile(databasePath, 'utf8');
  });

  it('does not contain curly quotes or apostrophes', function() {

    const LEFT_SINGLE_QUOTATION_MARK  = '‘';
    const RIGHT_SINGLE_QUOTATION_MARK = '’';
    const LEFT_DOUBLE_QUOTATION_MARK  = '“';
    const RIGHT_DOUBLE_QUOTATION_MARK = '”';

    const { text } = this;

    expect(text).to.not.include(LEFT_SINGLE_QUOTATION_MARK);
    expect(text).to.not.include(RIGHT_SINGLE_QUOTATION_MARK);
    expect(text).to.not.include(LEFT_DOUBLE_QUOTATION_MARK);
    expect(text).to.not.include(RIGHT_DOUBLE_QUOTATION_MARK);

  });

  it(`does not contain "3'"`, function() {
    expect(this.text).to.not.include(`3'`);
  });

  it('does not contain trailing semicolons at the ends of lines', function() {

    this.timeout(10000);

    const spinner = createSpinner('Checking for trailing semicolons.').start();

    const lines = this.text
    .split(/\r?\n/gu)
    .map(line => line.trim());

    for (const line of lines) {
      expect(line.endsWith(';')).to.be.false;
    }

    spinner.succeed();

  });

});
