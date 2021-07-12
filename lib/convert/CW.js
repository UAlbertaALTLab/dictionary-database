import readToolbox from '../utilities/readToolbox.js';
import writeNDJSON from '../utilities/writeNDJSON.js';

/**
 * Remove punctuation from the head, returning the lemma.
 * @param  {String} string The head to convert.
 * @return {String}
 */
function head2lemma(string) {
  return string.replace(/[!?]/gu, ``);
}

/**
 * Convert a string in the proto-orthography (with <ý> or <ń>) to a Plains Cree SRO transcription (with <y> only).
 * @param  {String} string The string to transliterate.
 * @return {String}
 */
function proto2sro(string) {
  return string
  .normalize()
  .replace(/ń/gu, `y`)  // U+0144
  .replace(/ý/gu, `y`); // U+00FD
}

/**
 * Takes a Toolbox entry Object and splits it into 2 or more Toolbox entries depending on the number of definition + part-of-speech fields.
 * @param  {Object} toolboxEntry The Toolbox entry to split, if needed.
 * @return {Object|Array}        Returns the original entry if no splitting is necessary, or an Array of the new entries if the entry was split.
 */
function splitEntry(toolboxEntry) {

  const { definitions, original, pos, sro, test } = toolboxEntry;

  // missing definitions or POS (usually just in test entries)
  if (!(definitions.length && pos.length)) {
    return toolboxEntry;
  }

  // 1 definition, 1 POS
  if (
    definitions.length === 1
    && pos.length === 1
  ) {
    return toolboxEntry;
  }

  // 1 POS, multiple definitions
  if (
    pos.length === 1
    && definitions.length > 1
  ) {
    return definitions.map(definition => {
      const clone       = JSON.parse(JSON.stringify(toolboxEntry));
      clone.definitions = [definition];
      return clone;
    });
  }

  // return a ParseError object if the number of definitions does not match the number of POS codes
  if (pos.length !== definitions.length) {
    return new ParseError(`Different number of definitions and POS codes.`, {
      code: `NumDefMismatch`,
      original,
      sro,
      test,
    });
  }

  // multiple definitions, multiple POS
  return definitions.map((definition, i) => {
    const clone       = JSON.parse(JSON.stringify(toolboxEntry));
    clone.definitions = [definition];
    clone.pos         = pos[i];
    return clone;
  });

  // NOTE: There are no entries with 1 definition + multiple parts of speech

}

/**
 * A class representing a CW database entry in DaFoDiL format.
 */
class Entry {

  /**
   * Create a new CW database entry from the original Toolbox entry.
   * @param {Object} toolboxEntry A Toolbox entry (returned from `readToolbox.js`)
   */
  constructor({
    definitions,
    original,
    pos,
    sro,
    syll,
    test,
  }) {

    this.original = original;
    this.pos      = pos;
    this.test     = test;

    this.head = {
      proto: sro, // the CW \sro field is actually the proto-orthography
      sro:   proto2sro(sro),
      syll,
    };

    this.lemma = {
      proto: head2lemma(this.head.proto),
      sro:   head2lemma(this.head.sro),
      syll,  // punctuation never appears in this field in the Toolbox file
    };

    this.senses = definitions.map(definition => ({ definition }));

  }

}

/**
 * A class representing a parsing error.
 * @extends Error
 */
class ParseError extends Error {
  /**
   * Create a new ParseError.
   * @param {String} message       The error message to display.
   * @param {Object} info          An object containing further information about the error.
   * @param {String} info.code     A code for this error.
   * @param {String} info.original The text of the original Toolbox entry.
   * @param {String} info.sro      The value of the \sro field from the original entry.
   * @param {String} info.test     The title of the test, if a test entry.
   */
  constructor(message, {
    code,
    original,
    sro,
    test,
  } = {}) {
    super(message);
    this.code           = code;
    this.name           = `ParseError`;
    this.original       = original;
    this.sro            = sro;
    if (test) this.test = test;
  }
}

/**
 * The main, top-level function which converts a Toolbox file to DaFoDiL.
 * @param  {String} toolboxPath The path to the Toolbox file.
 * @param  {String} outputPath  The path where the resulting NDJSON file should be saved.
 * @return {Array}              Returns an array of the entries in the database.
 */
export default async function convertCW(toolboxPath, outputPath) {

  let entries = await readToolbox(toolboxPath);

  entries = entries.map(splitEntry).flat();

  const errors = entries.filter(entry => entry.name === `ParseError`);

  entries = entries
  .filter(entry => entry.name !== `ParseError`)
  .map(toolboxEntry => new Entry(toolboxEntry));

  await writeNDJSON(outputPath, entries);

  return { entries, errors };

}
