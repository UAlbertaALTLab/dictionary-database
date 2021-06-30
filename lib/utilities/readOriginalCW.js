/**
 * This script parses Arok's original CW database, which was a set of text files
 * he wrote before beginning to use Toolbox. These files are located in the ALTLab
 * repo under `crk/dicts/CW_original`.
 */

import { promises as fsPromises } from 'fs';

import {
  extname as getExtname,
  join    as joinPath,
} from 'path';

const {
  readdir: readDir,
  readFile,
} = fsPromises;

const lineRegExp = /^(?<head>.+)\s*\\(?<POS>.+)<(?<definition>.+)(?<sources>\{.+\})?/u;

/**
 * Parses a single raw line / entry from the text database.
 * @param  {String} line The line to parse.
 * @return {Object}      An Object containing information parsed from the entry, containing the following fields: `head`, `POS`, `definition`, `sources`. The `sources` property is sometimes undefined.
 */
function parseLine(line) {
  return line.match(lineRegExp).groups;
}

/**
 * Reads Arok's original text document database and parses it into an Array of database objects.
 * @param  {String} dbDir The path to the directory where the database files are stored.
 * @return {Promise<Array>}
 */
export default async function readOriginalCW(dbDir) {

  const filenames = await readDir(dbDir);
  let   text      = ``;

  // merge all of the files into a single string for parsing
  for (const filename of filenames) {
    const ext = getExtname(filename);
    if (ext !== `.txt`) continue;
    text += await readFile(joinPath(dbDir, filename), `utf8`);
  }

  const newlineRegExp = /\r?\n/u;

  return text
  .split(newlineRegExp)
  .map(line => line.trim())
  .filter(Boolean)
  .map(parseLine);

}
