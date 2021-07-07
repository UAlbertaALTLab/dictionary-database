import { promises as fsPromises } from 'fs';

const { readFile } = fsPromises;

/**
 * A class representing a Toolbox entry.
 * @prop {String} original - The original text of the entry.
 * @prop {Array}  lines    - An Array of Objects containing information about each line.
 */
class ToolboxEntry {

  /**
   * Regular expression that matches the line code and text from a line.
   * @type {RegExp}
   */
  static lineCodeRegExp = /^\\(?<type>\S+)(?:\s+(?<text>.+))?$/u;

  /**
   * Create a new ToolboxEntry
   * @param {String} entryText The original text of the entry.
   */
  constructor(entryText) {

    this.original = entryText;

    this.lines = entryText
    .split(/\r?\n\s*/gu)
    .map(line => line.trim())
    .filter(Boolean)
    .map(ToolboxEntry.parseLine);

    this.sources = this.lines.filter(line => line.type === `src`).map(({ text }) => text);
    this.sro     = this.lines.find(line => line.type === `sro`)?.text;
    this.stem    = this.lines.find(line => line.type === `stm`)?.text;

  }

  /**
   * Compiles the Toolbox entry and returns the entry as a multiline String.
   * @return {String}
   */
  compile() {
    return this.lines
    .reduce((entry, { text, type }) => {
      entry += `\\${ type }`;
      if (text) entry += ` ${ text }`;
      entry += `\r\n`;
      return entry;
    }, ``);
  }

  /**
   * Parses a line from a Toolbox file and returns an Object containing information about that line. This method is designed to be passed to a `.map()` function.
   * @param  {String}  line The Toolbox line to parse.
   * @param  {Integer} i    The index of the line within the Toolbox entry.
   * @return {Object}       Returns an object with `type` (the line type, using the initial backslash code), `text`, and `index`.
   */
  static parseLine(line, index) {
    const { text, type } = line.match(ToolboxEntry.lineCodeRegExp).groups;
    return { index, text, type };
  }

}

/**
 * Reads a Toolbox file and returns an Array of entries, where each entry is an Array of lines in the entry. This script does not do any analysis of lines. Each line is preserved and passed through as is.
 * @param  {String} toolboxPath The path to the Toolbox file.
 * @return {Promise<Array>}
 */
export default async function readToolbox(toolboxPath) {

  const text    = await readFile(toolboxPath, `utf8`);
  let   entries = text.split(/(?:\r?\n\s*){2,}/gu);
  const header  = entries.shift();

  entries = entries.map((entryText, index) => {
    const entry = new ToolboxEntry(entryText);
    entry.index = index;
    return entry;
  });

  entries.header = header;

  return entries;

}
