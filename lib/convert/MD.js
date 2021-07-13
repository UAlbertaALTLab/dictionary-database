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
    SRO,
    Syllabics,
    POS,
    test,
  }) {

    this.test = test;

    this.head = {
      md:   SRO,
      syll: Syllabics,
    };

    this.lemma = {
      md:   this.head.md.replace(Entry.#puncRegExp, ``),
      syll: this.head.syll.replace(Entry.#puncRegExp, ``),
    };

    // NOTE: POS can be empty or null
    this.pos = posMap.get(POS);

  }

  /**
   * Matches questions or exclamation points.
   * @type {RegExp}
   */
  static #puncRegExp = /[?!]/gu;

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
  let   entries = await readTSV(inputPath, { relaxColumnCount: true });
  entries       = entries.map(data => new Entry(data));

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
