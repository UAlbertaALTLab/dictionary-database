/* eslint-disable
  max-params,
  max-statements,
*/

import createSpinner         from 'ora';
import { createWriteStream } from 'fs';
import ProgressBar           from 'progress';
import readOriginalCW        from '../utilities/readOriginalCW.js';
import readToolbox           from '../utilities/readToolbox.js';

/**
 * Merges the sources of the original entry and the Toolbox entry, returning an updated Toolbox entry.
 * @param  {Object} toolboxEntry  The Toolbox entry object.
 * @param  {Object} originalEntry The original entry object.
 */
function mergeSources(toolboxEntry, originalEntry) {

  // update Toolbox entry with an Array of unique, sorted sources from both entries
  toolboxEntry.sources = Array.from(new Set([...originalEntry.sources, ...toolboxEntry.sources]))
  .sort();

  // remove source lines from the Toolbox entry
  toolboxEntry.lines = toolboxEntry.lines.filter(line => line.type !== `src`);

  // remove the original timestamp (`\dt`) line
  toolboxEntry.lines = toolboxEntry.lines.filter(line => line.type !== `dt`);

  // TODO: pick up here

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

  for (const originalEntry of originalEntries.slice(0, 10)) {

    let { POS, head } = originalEntry;

    head = head.replace(/Y/gu, `ý`);
    POS  = POS.replace(/VAIt$/u, `VTI`);

    let toolboxEntry = toolboxIndex.get(head);

    if (Array.isArray(toolboxEntry)) {

      const matches = toolboxEntry;

      toolboxEntry = matches.find(tbe => tbe.sro === head.replace(/-$/u, ``)); // tbe = ToolboxEntry

      if (!toolboxEntry) {
        // TODO: attempt to find a match a different way
      }

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

  await new Promise((resolve, reject) => {

    const writeStream = createWriteStream(outPath);

    writeStream.on(`finish`, resolve);
    writeStream.on(`error`, reject);

    writeStream.write(`${ toolboxEntries.header }\r\n\r\n`);

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
