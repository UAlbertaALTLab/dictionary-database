import { expect } from 'chai';

/**
 * Finds the first entry in the test database whose \test field matches the test description
 * @param  {Object} ctx The Mocha test context
 * @return {Object}     Returns the relevant test entry
 */
export default function getTestEntry(ctx) {
  const matchedEntry = ctx.data.find(entry => entry.test === ctx.test.title);
  if (!matchedEntry) expect.fail(`No test database entry found for test "${ctx.test.title}"`);
  return matchedEntry;
}
