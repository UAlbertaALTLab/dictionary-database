/**
 * This script parses Arok's original CW database, which was a set of text files
 * he wrote before beginning to use Toolbox. These files are located in the ALTLab
 * repo under `crk/dicts/CW_original`.
 */

import { promises as fsPromises } from 'fs';

const { readFile }  = fsPromises;
const lineRegExp    = /^(?<head>.+)\s*\\(?<POS>.+)<(?<definitions>.+)$/u;
const newlineRegExp = /\r?\n/u;
const sourcesRegExp = /\{(?<sourcesList>.+?)\}/gu;

/**
 * Parses a single raw line / entry from the text database.
 * @param  {String} line The line to parse.
 * @return {Object}      An Object containing information parsed from the entry, containing the following fields: `head`, `POS`, `definitions`, `sources`, and `text` (the original text of the line). The `sources` property is always an Array, but sometimes zero length.
 */
function parseLine(line) {

  const { groups }           = line.match(lineRegExp);
  const { POS, definitions } = groups;
  let   { head }             = groups;

  // clean up head of entry

  head = head.replace(/^\(/u, ``);

  // extract sources

  const matches = definitions.matchAll(sourcesRegExp);
  let   sources = new Set;

  const addSource = source => sources.add(source);

  for (const match of matches) {
    match.groups.sourcesList
    .split(/,\s*/u)
    .filter(Boolean)
    .forEach(addSource);
  }

  sources = Array.from(sources);

  return {
    POS,
    definitions,
    head,
    sources,
    text: line,
  };

}

/**
 * Reads Arok's original text document database and parses it into an Array of database objects.
 * @param  {String} dbPath The path to the database file.
 * @return {Promise<Array>}
 */
export default async function readOriginalCW(dbPath) {

  const text = await readFile(dbPath, `utf8`);

  return text
  .split(newlineRegExp)
  .map(line => line.trim())
  .filter(Boolean)
  .map(parseLine);

}

readOriginalCW(`data/Wolvengrey-original.txt`);
