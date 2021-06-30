/* eslint-disable
  max-params,
  max-statements,
*/

import createHomographKey    from '../utilities/createHomographKey.js';
import createSpinner         from 'ora';
import { createWriteStream } from 'fs';
import Index                 from '../utilities/DatabaseIndex.js';
import ProgressBar           from 'progress';
import readOriginalCW        from '../utilities/readOriginalCW.js';
import readToolbox           from '../utilities/readToolbox.js';

/**
 * Merges the sources of the original entry and the Toolbox entry, returning an updated Toolbox entry.
 * @param  {Object} toolboxEntry  The Toolbox entry object.
 * @param  {Object} originalEntry The original entry object.
 */
function mergeSources(toolboxEntry, originalEntry) {

  // get the sources from both original and Toolbox entries
  const originalSources = originalEntry.sources;

  const toolboxSources = toolboxEntry
  .filter(line => line.startsWith(`\\src`))
  .map(line => line.replace(/\\src\s+/u, ``))
  .map(line => line.trim())
  .filter(Boolean);

  // create an unique, sorted Array of all the sources
  const sources = Array.from(new Set([...originalSources, ...toolboxSources]))
  .sort();

  // remove the original timestamp line
  // (which is always the last line in the entry)
  let timestampLine = toolboxEntry.pop();

  // create Arrays of non-source lines and source lines
  const nonSourceLines = toolboxEntry.filter(line => !line.startsWith(`\\src`));
  const sourceLines    = sources.map(source => `\\src ${ source }`);

  // build the new Toolbox entry
  const lines = [...nonSourceLines, ...sourceLines];

  // check to see whether entry has changed
  // and update timestamp if so
  const oldEntry = toolboxEntry.join(`\r\n`);
  const newEntry = lines.join(`\r\n`);

  if (newEntry !== oldEntry) {

    // format timestamp as 30/Jun/2021
    const timestamp = new Date()
    .toLocaleDateString(`en-GB`, {
      day:   `2-digit`,
      month: `short`,
      year:  `numeric`,
    })
    .replace(/ /gu, '/');

    timestampLine = `\\dt ${ timestamp }`;

  }

  // build and return the new Toolbox entry
  const newData = [...lines, timestampLine];
  newData.index = toolboxEntry.index;

  return newData;

}

/**
 * Reads in the original CW database, extracts the sources for each entry, and adds them to the matching Toolbox entry, if any.
 * @param  {String}         sourcesPath               The path to the original CW database file.
 * @param  {String}         toolboxPath               The path to the CW Toolbox file.
 * @param  {Boolean}        [outPath=toolboxPath]     Where to write the updated Toolbox file to. Defaults to the path of the original, which will overwrite the original file.
 * @param  {Object}         [options={}]              An optional options hash.
 * @param  {Boolean|String} [options.reportUnmatched] If `true`, outputs a list of entries from the original database that do not have matches in the Toolbox database. If a String, treats that String as a file path and outputs the list to a new file at that location.
 * @return {Promise}
 */
export default async function importCWSources(
  sourcesPath,
  toolboxPath,
  outPath = toolboxPath,
  { reportUnmatched = true } = {},
) {

  // load data

  console.info(`\n`);

  const loadingSpinner  = createSpinner(`Loading data sources.`).start();
  const originalEntries = await readOriginalCW(sourcesPath);
  const toolboxEntries  = await readToolbox(toolboxPath);
  const toolboxHeader   = toolboxEntries.shift();
  const noStems         = [];
  const unmatched       = [];

  toolboxEntries.forEach((entry, i) => {
    entry.index = i;
  });

  loadingSpinner.succeed(`Data sources loaded.`);

  // create an index of entries in the Toolbox file

  const indexSpinner = createSpinner(`Indexing Toolbox file.`).start();

  const toolboxIndex = new Index(toolboxEntries, (entry, index) => {

    const stem = entry
    .find(line => line.startsWith(`\\stm`))
    ?.replace(/\\stm\s*/u, ``)
    .trim();

    if (!stem) {
      noStems.push(entry);
      return;
    }

    const [POS] = entry
    .find(line => line.startsWith(`\\ps`))
    .replace(/\\ps\s+/u, ``)
    .split(`-`);

    return createHomographKey(`${ stem }@${ POS }`, index);

  });

  indexSpinner.succeed(`Toolbox file indexed.`);

  // attempt to update Toolbox entries with sources from original entries

  const progressBar = new ProgressBar('Updating entries. :bar :current/:total :percent', { total: originalEntries.length });

  for (const originalEntry of originalEntries) {

    let { POS, head } = originalEntry;

    head = head.replace(/Y/gu, `ý`);
    POS  = POS.replace(/t$/u, ``);

    const key          = `${ head }@${ POS }`;
    const toolboxEntry = toolboxIndex.get(key);

    if (!toolboxEntry) {
      unmatched.push(originalEntry);
      progressBar.tick();
      continue;
    }

    const mergedEntry = mergeSources(toolboxEntry, originalEntry);

    toolboxIndex.set(key, mergedEntry);
    progressBar.tick();

  }

  // compile and output the new Toolbox file

  const writeSpinner = createSpinner(`Writing new Toolbox file.`).start();

  const formatEntry = entry => entry
  .map(line => line.trim())
  .filter(Boolean);

  const updatedToolboxData = [
    ...toolboxIndex.values(),
    ...noStems,
  ]
  .map(formatEntry)
  .map(entry => entry.join(`\r\n`))
  .sort();

  updatedToolboxData.unshift(...formatEntry(toolboxHeader));

  await new Promise((resolve, reject) => {

    const writeStream = createWriteStream(outPath);

    writeStream.on(`finish`, resolve);
    writeStream.on(`error`, reject);

    for (const entry of updatedToolboxData) {
      writeStream.write(`${ entry }\r\n\r\n`);
    }

    writeStream.end();

  });

  writeSpinner.succeed(`New Toolbox file written.`);

  // report on unmatched entries

  if (typeof reportUnmatched === `string`) {

    return new Promise((resolve, reject) => {

      const reportSpinner = createSpinner(`Creating unmatched entries report.`).start();
      const writeStream   = createWriteStream(reportUnmatched);

      writeStream.on(`finish`, () => {
        reportSpinner.succeed(`Created unmatched entries report.`);
        resolve();
      });
      writeStream.on(`error`, reject);

      for (const entry of unmatched) {
        writeStream.write(`${ entry.text }\r\n`);
      }

      writeStream.end();

    });

  }

  if (reportUnmatched) {
    console.info(`Displaying unmatched entries:`);
    console.info(unmatched);
  }

  console.info(`\n`);

}
