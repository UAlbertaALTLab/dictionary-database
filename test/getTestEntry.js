import { expect } from 'chai';

/**
 * Finds the first entry in the test database whose "test" property matches the test title
 * @param  {Array}  data      The array of test database entries (within a Mocha test: this.data).
 * @param  {String} testTitle The title of the test (within a Mocha test: this.test.title).
 * @return {Object}           Returns the relevant test entry
 */
export default function getTestEntry(data, testTitle) {
  const matchedEntry = data.find(entry => entry.test === testTitle);
  if (!matchedEntry) expect.fail(`No test database entry found for test "${ testTitle }"`);
  return matchedEntry;
}
