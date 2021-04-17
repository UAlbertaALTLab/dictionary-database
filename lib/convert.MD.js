import createCSVStream from 'csv-parse';
import ndjson          from 'ndjson';
import setKeys         from './setKeys.js';

import {
  createReadStream,
  createWriteStream,
} from 'fs';

/**
 * Extracts certain kinds of information from the definition and updates the Sense and Lexeme objects as appropriate.
 * @param  {String} definition The definition to parse (Sense.definition).
 * @param  {Object} sense      The Sense object.
 * @param  {Object} entry      The Lexeme (Entry) object.
 */
function cleanDefinition(definition, sense, entry) {

  const hasAnimacyInfo = /animate/iu.test(definition);

  if (hasAnimacyInfo) {

    entry.features         = entry.features ?? {};
    entry.features.animate = !/inanimate/iu.test(definition);

    const basicAnimacyRegExp         = /(?<punctuation>[.!?])\s+(?:in)?animate\.\s*/giu;
    const parentheticalAnimacyRegExp = /\s*\((?:in)?animate\)\s*/giu;

    sense.definition = sense.definition
    .replace(basicAnimacyRegExp, '$<punctuation>')
    .replace(parentheticalAnimacyRegExp, '');

  }

}

/**
 * Converts a record in the Maskwacîs CSV to a DLx Lexeme object.
 * @param  {Object} record An Object representing a row/record in the Maskwacîs CSV.
 * @return {Object}        Returns a DLx Lexeme object.
 */
function convertRecord({
  English_POS,
  English_Search,
  MeaningInEnglish,
  POS,
  RapidWordIndices,
  RapidWordsClasses,
  SRO,
  Syllabics,
  test,
}) {

  const semanticInfo = {
    semanticDomains: splitSemanticDomains(RapidWordsClasses),
    semanticIndices: splitSemanticDomains(RapidWordIndices),
  };

  const senses = splitDefinition(MeaningInEnglish)
  .map(sense => Object.assign({ category: POS, definition: sense }, semanticInfo))
  .filter(sense => sense.definition); // remove senses with dempty definitions

  const entry = {
    English_POS,
    English_Search,
    RapidWordIndices,
    RapidWordsClasses,
    definition: MeaningInEnglish,
    lemma:      {
      sro:       SRO,
      syllabics: Syllabics,
    },
    senses,
    test,
  };

  senses.forEach(sense => cleanDefinition(sense.definition, sense, entry));

  return entry;

}

/**
 * Reads the CSV file into an Array of JSON objects
 * @param  {String}         inputPath The path to the MD CSV file.
 * @return {Promise<Array>}           Resolves to an Array of Objects representing CSV entries.
 */
async function readCSV(inputPath) {

  const csvOptions = {
    columns:   true,
    delimiter: '\t',
    relax:     true,
  };

  const readStream = createReadStream(inputPath);
  const csvStream  = createCSVStream(csvOptions);

  readStream.pipe(csvStream);

  const records = [];

  for await (const record of csvStream) {
    records.push(record);
  }

  return records;

}

/**
 * Splits a string into senses based on sense numbers (1., 2. etc.).
 * @param  {String} definition The string to split.
 * @return {Array}             Returns an array of definitions, even when only one sense/definition is present.
 */
function splitDefinition(definition) {
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
function splitSemanticDomains(rapidWordsClasses) {
  return rapidWordsClasses.split(/;\s*/u);
}

/**
 * Writes the database entries to an NDJSON file.
 * @param  {String} outputPath The path to write the NDJSON file to.
 * @param  {Array}  entries    The Array of entries to write.
 * @return {Promise}
 */
function writeEntries(outputPath, entries) {
  return new Promise((resolve, reject) => {

    const jsonStream  = ndjson.stringify();
    const writeStream = createWriteStream(outputPath);

    jsonStream.on('error', err => {
      console.error('Error in JSON stream:');
      reject(err);
    });
    writeStream.on('error', err => {
      console.error('Error in write stream:');
      reject(err);
    });
    writeStream.on('close', resolve);
    jsonStream.pipe(writeStream);
    entries.forEach(entry => jsonStream.write(entry));
    jsonStream.end();

  });
}

export default async function convertCW(inputPath, outputPath) {

  if (!inputPath) {
    throw new Error('Please provide the path to the Maskwacîs database as the first argument.');
  }

  const records = await readCSV(inputPath);
  const entries = records.map(convertRecord);

  setKeys(entries);

  if (outputPath) await writeEntries(outputPath, entries);

  return entries;

}
