import createSpinner from 'ora';
import fs from 'fs-extra';
import readTSV       from '../utilities/readTSV.js';
import writeNDJSON   from '../utilities/writeNDJSON.js';

const { readJSON } = fs;

/**
 * A map of parts of speech in the Maskwacîs database to more normalized parts of speech. This value is assigned asynchronously when the script is run.
 * @type {Object}
 */
let posMap;

/**
 * A class representing a Maskwacîs database entry in DLx JSON format.
 */
class Entry {

  /**
   * Create a new Entry.
   * @param {Object} record A TSV record, as an Object.
   */
  constructor({
    MeaningInEnglish,
    original,
    RapidWordsClasses,
    RapidWordsIndices,
    SRO,
    Syllabics,
    POS,
    test,
  }) {

    this.head = {
      md:   SRO,
      syll: Syllabics,
    };

    this.lemma = {
      md:   Entry.#removePunctuation(this.head.md),
      syll: Entry.#removePunctuation(this.head.syll),
    };

    this.original        = original;
    this.pos             = posMap.get(POS); // NOTE: POS can be empty or null
    this.semanticDomains = Entry.#splitSemanticDomains(RapidWordsClasses);
    this.semanticIndices = Entry.#splitSemanticDomains(RapidWordsIndices);
    this.test            = test;

    this.senses = Entry.#splitDefinition(MeaningInEnglish)
    .map(definition => ({ definition }));

  }

  /**
   * Removes a question mark or exclamation point from a string.
   * @param  {String} string The String to remove punctuation from.
   * @return {String}
   */
  static #removePunctuation(string) {
    return string.replace(/[?!]/gu, ``);
  }

  /**
   * Splits a string into senses based on sense numbers (1., 2. etc.).
   * @param  {String} definition The string to split.
   * @return {Array}             Returns an array of definitions, even when only one sense/definition is present.
   */
  static #splitDefinition(definition) {
    return definition
    .split(/[1-9]\./u)       // divide definition by sense numbers
    .filter(Boolean)         // remove empty strings
    .map(str => str.trim()); // trim white space
  }

  /**
   * Parses the RapidWordsClasses or RapidWordIndices field into an array of semantic domains/indices.
   * @param  {String}        rapidWordsClasses The raw string contained in the RapidWordsClasses field.
   * @return {Array<String>}                   Returns an array of semantic domains.
   */
  static #splitSemanticDomains(rapidWordsClasses) {
    return rapidWordsClasses.split(/;\s*/u);
  }

}

/**
 * Convert the Maskwacîs database to DLx JSON format.
 * @param  {String} inputPath    The path to the Maskwacîs TSV file.
 * @param  {String} [outputPath] The path where the output NDJSON data should be written.
 * @return {Object}              Returns an Object with `entries` and `errors` properties, both Arrays.
 */
export default async function convertMD(inputPath, outputPath) {

  const posTable = await readJSON(`./lib/constants/MD-pos.json`);
  posMap         = new Map(Object.entries(posTable));

  const errors  = [];
  let   entries = await readTSV(inputPath, { raw: true, relaxColumnCount: true });

  entries = entries.map(({ record, raw }) => {
    record.original = raw;
    return new Entry(record);
  });

  if (outputPath) {
    const writeFileSpinner = createSpinner(`Writing entries to NDJSON file.`).start();
    await writeNDJSON(outputPath, entries);
    writeFileSpinner.succeed(`Entries written to NDJSON file.\n`);
  }

  return {
    entries,
    errors,
  };

}
