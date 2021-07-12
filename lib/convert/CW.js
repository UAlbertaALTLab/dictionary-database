import createSpinner from 'ora';
import readToolbox   from '../utilities/readToolbox.js';
import writeNDJSON   from '../utilities/writeNDJSON.js';

/**
 * Remove punctuation from the head, returning the lemma.
 * @param  {String} string The head to convert.
 * @return {String}
 */
function head2lemma(string) {
  return string?.replace(/[!?]/gu, ``);
}

/**
 * Convert a string in the proto-orthography (with <ý> or <ń>) to a Plains Cree SRO transcription (with <y> only).
 * @param  {String} string The string to transliterate.
 * @return {String}
 */
function proto2sro(string) {
  return string
  ?.normalize()
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
    return new ParseError(`Missing definitions or POS.`, {
      code: `MissingDefOrPOS`,
      original,
      sro,
      test,
    });
  }

  // 1 definition, 1 POS
  if (
    definitions.length === 1
    && pos.length === 1
  ) {
    toolboxEntry.definition = definitions.pop();
    delete toolboxEntry.definitions;
    return toolboxEntry;
  }

  // 1 POS, multiple definitions
  if (
    pos.length === 1
    && definitions.length > 1
  ) {
    return definitions.map(definition => {
      const clone      = JSON.parse(JSON.stringify(toolboxEntry));
      clone.definition = definition;
      delete clone.definitions;
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
    const clone      = JSON.parse(JSON.stringify(toolboxEntry));
    clone.definition = definition;
    clone.pos        = pos[i];
    delete clone.definitions;
    return clone;
  });

  // NOTE: There are no entries with 1 definition + multiple parts of speech

}

/**
 * A class representing a database entry, in DaFoDiL format.
 */
class Entry {

  /**
   * Create a new CW database entry from the original Toolbox entry.
   * @param {Object} toolboxEntry A Toolbox entry (returned from `readToolbox.js`)
   */
  constructor({
    definition,
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

    this.senses = Entry.#splitDefinition(definition);

    this.#extractParentheticals();

    // remove any senses with empty definitions
    this.senses = this.senses.filter(sense => Boolean(sense.definition));

  }

  /**
   * Extracts any parentheticals from a sense and stores them in `sense.parentheticals`.
   */
  #extractParentheticals() {

    // Structure of Definitions
    // ====
    // Definitions may contain multiple parentheticals, in [brackets].
    // Parentheticals may themselves contain multiple notes, separated by semicolons.
    // Some notes are associated with the entire entry.
    // Other notes are associated with the particular definition they're in.

    this.senses.forEach(sense => {

      // extract any parentheticals from the definitions
      const { definition, parenthetical } = Entry.#extractParenthetical(sense.definition);

      // use the new, cleaned definition for the sense
      sense.definition = definition;

      // divide any parentheticals into separate notes
      sense.parentheticals = parenthetical
      ?.split(`;`)
      .map(str => str.trim())
      .filter(Boolean);

    });

  }

  /**
   * Matches parenthetical notes in a definition.
   * @type {RegExp}
   */
  static #parentheticalRegExp = /^(?<textBefore>.*)\[(?<parenthetical>.+)\](?<textAfter>.*)/u;

  /**
   * Accepts a single definition (not multiple definitions with semicolons) and returns an object with "definition" and "parenthetical" properties. The definition will have the text of the parenthetical stripped from it.
   * @param  {String} definition The definition to extract parentheticals from.
   * @return {Object}            Returns an object with "definition" and "parenthetical" properties. "parenthetical" may be undefined.
   */
  static #extractParenthetical(definition) {

    const parentheticalMatch = definition.match(Entry.#parentheticalRegExp);

    if (!parentheticalMatch) return { definition };

    const { parenthetical, textBefore, textAfter } = parentheticalMatch.groups;

    return {
      definition:    [textBefore, textAfter].map(str => str.trim()).join(``),
      parenthetical: parenthetical.trim(),
    };

  }

  /**
   * Splits the original definition into multiple definitions based on semicolons, while taking into account that parentheticals may contain semicolons as well.
   * @param  {String} [input=''] The original definition from the Toolbox file
   * @return {Array}             Returns an Array of definitions.
   */
  static #splitDefinition(definition) {

    if (!definition) return [];

    const chunks            = definition.split(`;`).map(str => str.trim());
    let   currentDefinition = [];
    let   inParenthetical   = false;

    return chunks.reduce((defs, chunk) => {

      const hasOpeningBracket = chunk.includes(`[`);
      const hasClosingBracket = chunk.includes(`]`);

      currentDefinition.push(chunk);

      // in the middle of a parenthetical
      if (hasOpeningBracket && !hasClosingBracket) inParenthetical = true;

      // parenthetical is complete
      if (!hasOpeningBracket && hasClosingBracket) inParenthetical = false;

      // unless in the middle of a parenthetical,
      // push the current definition to the definitions array
      if (!inParenthetical) {
        defs.push(currentDefinition.join(`; `));
        currentDefinition = [];
      }

      return defs;

    }, [])
    .map(def => ({ definition: def }));

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

  let   entries           = await readToolbox(toolboxPath);
  const conversionSpinner = createSpinner(`Converting Toolbox entries to JSON.`).start();
  entries                 = entries.map(splitEntry).flat();
  const errors            = entries.filter(entry => entry.name === `ParseError`);

  entries = entries
  .filter(entry => entry.name !== `ParseError`)
  .map(toolboxEntry => new Entry(toolboxEntry));

  conversionSpinner.succeed(`Toolbox entries converted to JSON.`);

  const writeFileSpinner = createSpinner(`Writing entries to NDJSON file.`).start();
  await writeNDJSON(outputPath, entries);
  writeFileSpinner.succeed(`Entries written to NDJSON file.\n`);

  return { entries, errors };

}
