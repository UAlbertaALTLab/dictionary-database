/* eslint-disable
  max-params,
  max-statements,
*/

import createSpinner         from 'ora';
import { createWriteStream } from 'fs';
import ProgressBar           from 'progress';
import readOriginalCW        from '../utilities/readOriginalCW.js';
import readToolbox           from '../utilities/readToolbox.js';

let numEntriesUpdated = 0;

/**
 * Merges the sources of the original entry and the Toolbox entry. Modifies the original Toolbox entry.
 * @param  {Object} toolboxEntry  The Toolbox entry object.
 * @param  {Object} originalEntry The original entry object.
 */
function mergeSources(toolboxEntry, originalEntry) {

  // extract timestamp (`\dt`) line (which is always last) for later comparison
  const dtLine = toolboxEntry.lines.pop();

  // update Toolbox entry with an Array of unique, sorted sources from both entries
  toolboxEntry.sources = Array.from(new Set([...originalEntry.sources, ...toolboxEntry.sources]))
  .sort();

  // remove source lines from the Toolbox entry
  toolboxEntry.lines = toolboxEntry.lines.filter(line => line.type !== `src`);

  // add the new source lines
  toolboxEntry.sources.forEach(source => toolboxEntry.lines.push({
    index: toolboxEntry.lines.length,
    text:  source,
    type:  `src`,
  }));

  // if the entry has not changed, re-add original timestamp (`\dt`) line and return early
  const noChange = toolboxEntry.original.startsWith(toolboxEntry.compile());

  if (noChange) {
    toolboxEntry.lines.push(dtLine);
    return;
  }

  // create timestamp formatted as 30/Jun/2021
  const timestamp = new Date()
  .toLocaleDateString(`en-GB`, {
    day:   `2-digit`,
    month: `short`,
    year:  `numeric`,
  })
  .replace(/ /gu, '/');

  // add the new timestamp (`\dt`) line
  toolboxEntry.lines.push({
    index: toolboxEntry.lines.length,
    text:  timestamp,
    type:  `dt`,
  });

  numEntriesUpdated++;

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
  let   toolboxEntries  = await readToolbox(toolboxPath);
  const toolboxHeader   = toolboxEntries.header;
  const noStems         = [];
  const unmatched       = [];

  loadingSpinner.succeed(`Data sources loaded.`);

  // create an index of entries in the Toolbox file

  const indexSpinner = createSpinner(`Indexing Toolbox file.`).start();
  const toolboxIndex = new Map;

  for (const toolboxEntry of toolboxEntries) {

    if (!toolboxEntry.stem) {
      noStems.push(toolboxEntry);
      continue;
    }

    const existingEntry = toolboxIndex.get(toolboxEntry.stem);

    if (existingEntry) {
      if (Array.isArray(existingEntry)) existingEntry.push(toolboxEntry);
      else toolboxIndex.set(toolboxEntry.stem, [existingEntry, toolboxEntry]);
      continue;
    }

    toolboxIndex.set(toolboxEntry.stem, toolboxEntry);

  }

  indexSpinner.succeed(`Toolbox file indexed.`);

  // attempt to update Toolbox entries with sources from original entries

  const progressBar = new ProgressBar('Updating entries. :bar :current/:total :percent', { total: originalEntries.length });

  for (const originalEntry of originalEntries) {

    let { POS, head } = originalEntry;

    head = head.replace(/Y/gu, `ý`);
    POS  = POS.replace(/VAIt$/u, `VTI`);

    let toolboxEntry = toolboxIndex.get(head);

    if (Array.isArray(toolboxEntry)) {
      const matches = toolboxEntry;
      toolboxEntry = matches.find(tbe => tbe.sro === head.replace(/-$/u, ``)); // tbe = ToolboxEntry
      // TODO: Try other methods of finding matches
    }

    if (!toolboxEntry) {
      unmatched.push(originalEntry);
      progressBar.tick();
      continue;
    }

    mergeSources(toolboxEntry, originalEntry);
    progressBar.tick();

  }

  // compile and output the new Toolbox file

  const writeSpinner = createSpinner(`Writing new Toolbox file.`).start();

  toolboxEntries = toolboxEntries.map(entry => entry.compile());

  await new Promise((resolve, reject) => {

    const writeStream = createWriteStream(outPath);

    writeStream.on(`finish`, resolve);
    writeStream.on(`error`, reject);

    writeStream.write(`${ toolboxHeader }\r\n\r\n`);

    for (const entry of toolboxEntries) {
      writeStream.write(`${ entry }\r\n`);
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
        console.info(`Number of unmatched entries: ${ unmatched.length }`);
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
    console.info(`Number of unmatched entries: ${ unmatched.length }`);
  }

  console.log(`Number of entries updated: ${ numEntriesUpdated }\n`);

}
