/* eslint-disable
  class-methods-use-this,
*/

import convert                           from '@digitallinguistics/toolbox2json';
import { stringify as createJSONStream } from 'ndjson';
import { createWriteStream }             from 'fs';

/**
 * Add a note to an object's "notes" array.
 * @param {Object} note   The Note object to add
 * @param {Object} object The object to add the note to
 */
function addNote(note, object) {
  object.notes = object.notes ?? [];
  object.notes.push(note);
}

/**
 * Create a human-readable key from a lemma
 * @param  {String} lemma The lemma, including hyphens
 * @return {String}       Returns an ASCII key with no spaces or hyphens
 */
function createKey(lemma = ``) {

  // finds non-combining character followed by combining character
  const combiningRegExp = /(?<char>\P{Mark})(?<combiner>\p{Mark}+)/gu;

  return lemma
  // denormalize all characters into combining characters
  .normalize(`NFD`)
  // remove combining characters
  .replace(combiningRegExp, `$1`)
  // remove hyphens
  .replace(/-/gu, ``)
  // replace whitespace with underscores
  .replace(/\s+/gu, `_`);

}

/**
 * Accepts a single definition (not multiple definitions with semicolons) and returns an object with "definition" and "parenthetical" properties. The definition will have the text of the parenthetical stripped from it.
 * @param  {String} definition The definition to extract parentheticals from.
 * @return {Object}            Returns an object with "definition" and "parenthetical" properties. "parenthetical" may be undefined.
 */
function extractParenthetical(definition) {

  const parentheticalRegExp = /^(?<textBefore>.*)\[(?<parenthetical>.+)\](?<textAfter>.*)/u;
  const parentheticalMatch  = definition.match(parentheticalRegExp);

  if (!parentheticalMatch) return { definition };

  const { parenthetical, textBefore, textAfter } = parentheticalMatch.groups;

  return {
    definition:    [textBefore, textAfter].map(str => str.trim()).join(``),
    parenthetical: parenthetical.trim(),
  };

}

/**
 * Checks whether a string contains white space.
 * @param  {String}  str The string to check
 * @return {Boolean}
 */
function hasWhitespace(str) {
  return /\s/u.test(str);
}

/**
 * Sets the "key" field on each entry.
 * @param {Array} entry The Array of database entries.
 */
function setKeys(entries) {

  const keys = new Map;

  for (const entry of entries) {

    const key = createKey(standardizeSRO(entry.lemma.sro));
    let homographNum = 1;

    entry.key = key;

    // Iteratively checks whether the current key exists, and adds / updates
    // homograph numbers if so.
    const checkKey = () => {

      const existingEntry = keys.get(entry.key);

      if (existingEntry) {

        // If the existing entry doesn't yet have a homograph number,
        // add homograph number 1 to it and update the map of keys.
        if (homographNum === 1) {
          keys.delete(key);
          existingEntry.key += 1;
          keys.set(existingEntry.key, existingEntry);
        }

        // Update the current homograph number and key for the current entry
        homographNum++;
        entry.key = key + homographNum;
        checkKey();

      }

    };

    checkKey();
    keys.set(entry.key, entry);

  }

}

/**
 * Standardize an SRO transcription
 * @param  {String} string The string to standardize
 * @return {String}
 */
function standardizeSRO(string) {
  return [string]
  .map(str => str.normalize())
  .map(str => str.replace(/ń/gu, `y`)) // U+0144
  .map(str => str.replace(/ý/gu, `y`)) // U+00FD
  .shift();
}

/**
 * Strips the provided text from a string and returns the new string.
 * @param  {String} string The string to strip text from.
 * @param  {String} remove The text to strip from the string.
 * @return {String}        Returns the new string, with the desired text stripped from it.
 */
function stripText(string, remove) {
  return string.replace(remove, ``).trim();
}

/**
 * Writes the entries Array to a JSON file.
 * @param {String} outputPath The path where the JSON data should be written.
 * @param {Array}  entries    The Array of entries to write to the file.
 */
function writeEntries(outputPath, entries) {
  return new Promise((resolve, reject) => {

    const jsonStream  = createJSONStream();
    const writeStream = createWriteStream(outputPath);

    jsonStream.on(`error`, reject);
    writeStream.on(`finish`, resolve);
    writeStream.on(`close`, resolve);
    writeStream.on(`error`, reject);

    jsonStream.pipe(writeStream);

    entries.forEach(entry => jsonStream.write(entry));

    jsonStream.end();

  });
}

/**
 * A class representing a CW database entry.
 */
class Entry {

  /**
   * Create a new Entry (a DLx Lexeme object).
   * @param {Object} data The data for the entry, returned from the toolbox2json library.
   */
  constructor({
    def  = '',
    dl   = [],
    sro  = '',
    syl  = '',
    test = 'test',
  }) {

    this.data = {
      definition: def, // store original definition
      dialects:   dl,
      lemma:      {
        sro,
        syll: syl,
      },
      test,
    };

    this.cleanDialects();
    this.splitDefinition();
    this.cleanDefinitions();

  }

  /**
   * Adds a note to the entry.
   * @param {String} note The text of the note to add
   */
  addNote(note) {
    addNote(note, this.data);
  }

  /**
   * Extracts any parentheticals and other notes from the sense definitions and moves them to other fields as appropriate.
   */
  cleanDefinitions() {

    // Structure of Definitions
    // ====
    // Definitions may contain multiple parentheticals, in [brackets].
    // Parentheticals may themselves contain multiple notes, separated by semicolons.
    // Some notes are associated with the entire entry.
    // Other notes are associated with the particular definition they're in.

    this.data.senses.forEach(sense => {

      // extract any parentheticals from the definitions
      const { definition, parenthetical } = extractParenthetical(sense.definition);

      // use the new, cleaned definition for the sense
      sense.definition = definition;

      // divide any parentheticals into separate notes and process each note
      if (parenthetical) {
        const notes = parenthetical.split(`;`).map(str => str.trim());
        notes.forEach(note => this.processNote(note, sense));
      }

      // also extract any definitions that are actually unbracketed parentheticals
      this.processNote(sense.definition, sense);

    });

    // remove any senses with empty definitions,
    this.data.senses = this.data.senses.filter(({ definition }) => definition);

    // remove any senses whose definition match the text of a note
    this.data.senses = this.data.senses.filter(({ definition, notes = [] }) => {
      const matchedNote = notes.find(({ text }) => text === definition);
      return !matchedNote;
    });

  }

  /**
   * Reformats the "dialects" property.
   */
  cleanDialects() {

    let { dialects } = this.data;
    if (!dialects) return;
    dialects = Array.isArray(dialects) ? dialects : [dialects];

    this.data.dialects = dialects.map(dialect => {
      if (dialect.includes(`npC`)) return `nort2960`;
      if (dialect.includes(`pC`)) return `plai1258`;
      if (dialect.includes(`sC`)) return `swam1239`;
      if (dialect.includes(`wC`)) return `wood1236`;
      return `unknown`;
    });

  }

  /**
   * Extract the cross-reference from a note if present and save it to the entry / sense as appropriate.
   * @param {String} noteText The text of the note.
   * @param {Object} sense    The Sense associated with this note.
   */
  extractCrossReference(noteText, sense) {

    const crossRefRegExp = /(?<relationType>see|cf\.)\s(?<crossRefText>.+)\s*$/u;
    const match          = noteText.match(crossRefRegExp);

    if (!match) return;

    const { crossRefText, relationType } = match.groups;

    // strip cross-reference from the definition
    const [parenthetical] = match;
    sense.definition = stripText(sense.definition, parenthetical);

    // if the cross-reference text is multiple words, we can't assume it's a headword
    // save it as a general note instead
    // otherwise treat it as a headword and save it as a cross-reference lexical relation
    if (hasWhitespace(crossRefText)) {

      const note = {
        noteType: `general`,
        text:     noteText,
      };

      this.addNote(note);

    } else {

      const crossReference = {
        key:      createKey(crossRefText), // NOTE: this is not homograph-aware
        lemma:    { sro: crossRefText },
        relation: relationType === `see` ? `crossReference` : `compare`,
      };

      // NOTE: Cross-references are saved to the entry rather than the sense,
      // even though Arok's intention may sometimes have been to associate
      // cross-references with specific senses.
      this.data.lexicalRelations = this.data.lexicalRelations ?? [];
      this.data.lexicalRelations.push(crossReference);

    }

  }

  /**
   * Extract the note and save it to the sense
   * @param  {String} noteText
   * @param  {Object} sense
   */
  extractGeneralNote(noteText, sense) {

    // if you're looking at a plain definition, do nothing
    if (noteText === sense.definition) return;

    // otherwise, add a general note
    const note = {
      noteType: `general`,
      text:     noteText,
    };

    // if definition is empty, add note to entry
    // otherwise add it to the sense
    addNote(note, sense.definition ? sense : this.data);

  }

  /**
   * Extract the Latin term and save it to the sense
   * @param  {String} noteText
   * @param  {Object} sense
   */
  extractLatinTerm(noteText, sense) {

    const latinTermRegExp = /^(?:Lt[:.]|Latin:?)\s+(?<scientificName>.+)\s*$/u;
    const match           = noteText.match(latinTermRegExp);

    if (!match) return;

    // strip scientific term from the definition
    const [parenthetical] = match;
    sense.definition = stripText(sense.definition, parenthetical);

    sense.scientificName = match.groups.scientificName;

  }

  /**
   * Extract the literal definition from a note and save it to the entry
   * @param {String} noteText The text of the note
   * @param {Object} sense    The Sense associated with this note
   */
  extractLiteralDefinition(noteText, sense) {

    const literalDefinitionRegExp = /^(?:lit[:.]{1,2}|literally:?)\s+(?<literalDefinition>.+)\s*$/u;
    const match                   = noteText.match(literalDefinitionRegExp);

    if (!match) return;

    // strip literal definition from the definition
    const [parenthetical] = match;
    sense.definition = stripText(sense.definition, parenthetical);

    let { literalDefinition } = match.groups;

    // remove leading and trailing quotes
    literalDefinition = literalDefinition
    .replace(/^['"]/u, ``)
    .replace(/['"]$/u, ``);

    this.data.literalMeaning = literalDefinition;

  }

  /**
   * Extract the usage note and save it to the sense
   * @param  {String} noteText
   * @param  {Object} sense
   */
  extractUsageNote(noteText, sense) {

    const usageRegExp = /^(?<usage>.+):$/u;
    const match       = noteText.match(usageRegExp);

    if (!match) return;

    // strip usage note from the definition
    const [parenthetical] = match;
    sense.definition = stripText(sense.definition, parenthetical);

    const { usage } = match.groups;

    sense.usages = sense.usages ?? [];
    sense.usages.push(usage.trim());

  }

  /**
   * Determines the type of note, and adds the information to either the entry or the sense as appropriate.
   * @param  {String} noteText The text of the note (parenthetical)
   * @param  {Object} sense    The Sense object associated with this note
   */
  processNote(...args) {
    this.extractCrossReference(...args);
    this.extractLiteralDefinition(...args);
    this.extractLatinTerm(...args);
    this.extractUsageNote(...args);
    this.extractGeneralNote(...args);
  }

  /**
   * Splits the original definition into multiple definitions based on semicolons, while taking into account that parentheticals may contain semicolons as well.
   * @param  {String} [input=``] The original definition from the Toolbox file
   * @return {Array}             Returns an Array of definitions.
   */
  splitDefinition() {

    const { definition } = this.data;

    if (!definition) {
      this.data.senses = [];
      return;
    }

    const chunks            = definition.split(`;`).map(str => str.trim());
    let   currentDefinition = [];
    let   inParenthetical   = false;

    this.data.senses = chunks.reduce((defs, chunk) => {

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

export default async function convertCW(inputPath, outputPath) {

  if (!inputPath) {
    throw new Error(`Please provide the path to the *Cree: Words* Toolbox database as the first argument.`);
  }

  if (!outputPath) {
    throw new Error(`Please provide the path where you would like the converted file generated as the second argument`);
  }

  console.info(`\nConverting the *Cree: Words* database.`);
  let entries = await convert(inputPath, { parseError: `object` });
  entries = entries.map(entry => new Entry(entry).data);
  setKeys(entries);
  await writeEntries(outputPath, entries);
  console.info(`Finished converting the *Cree: Words* database.\n`);
  return entries;

}
