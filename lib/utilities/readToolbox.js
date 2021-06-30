import { promises as fsPromises } from 'fs';

const { readFile } = fsPromises;

/**
 * Reads a Toolbox file and returns an Array of entries, where each entry is an Array of lines in the entry. This script does not do any analysis of lines. Each line is preserved and passed through as is.
 * @param  {String} toolboxPath The path to the Toolbox file.
 * @return {Promise<Array>}
 */
export default async function readToolbox(toolboxPath) {

  const text = await readFile(toolboxPath, `utf8`);

  return text
  .split(/(?:\r?\n\s*){2,}/gu)
  .map(entry => entry.split(/\r?\n\s*/gu));

}
