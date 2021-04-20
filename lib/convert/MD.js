/**
 * This file exports a single function `convertMD` which converts the MD database to DLx JSON format.
 */

import Index                 from '../utilities/DatabaseIndex.js';
import createMDKey           from '../utilities/createMDKey.js';
import { createWriteStream } from 'fs';
import getMappings           from '../utilities/getMappings.js';
import ndjson                from 'ndjson';
import readTSV               from '../utilities/readTSV.js';

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
      md:        SRO,
      syllabics: Syllabics,
    },
    senses,
    test,
  };

  senses.forEach(sense => cleanDefinition(sense.definition, sense, entry));

  return entry;

}

function createCWKey({ mapping }) {
  if (!mapping) return;
  return `${ mapping.lemma_CW }:${ mapping.definition_CW }`;
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

/**
 * Convert the MD database to NDJSON.
 * @param  {String}  inputPath    The path to the original MD TSV data.
 * @param  {String}  outputPath   The path where the NDJSON version of the MD database should be saved.
 * @param  {String}  mappingsPath The path to the TSV file mapping MD entries to CW entries.
 * @return {Promise}              Returns a Promise that resolves to an Array of the MD entries.
 */
/* eslint-disable max-params, max-statements */
export default async function convertCW(inputPath, outputPath, mappingsPath, { silent = false } = {}) {

  if (!inputPath) {
    throw new Error('Please provide the path to the Maskwacîs database as the first argument.');
  }

  const records          = await readTSV(inputPath);
  const entries          = records.map(convertRecord);
  const mdIndex          = new Index(entries, entry => createMDKey(entry));
  const duplicateRecords = entries.length - mdIndex.size;
  let   totalMappings    = 0;

  // add MD > CW mappings to the MD entries
  if (mappingsPath) {

    const mappings = await getMappings(mappingsPath);
    totalMappings  = mappings.size;

    for (const entry of entries) {
      const key     = createMDKey(entry);
      const mapping = mappings.get(key);
      entry.mapping = mapping;
    }

  }

  const numMapped = entries.filter(entry => entry.mapping).length;

  // merge entries that map to the same CW entry
  const cwEntries     = new Map;
  const uniqueEntries = new Map;
  const mergedEntries = [];

  for (const [mdKey, mdEntry] of mdIndex) {

    if (!mdEntry.mapping) {
      uniqueEntries.set(mdKey, mdEntry);
      continue;
    }

    const cwKey   = createCWKey(mdEntry);
    const cwEntry = cwEntries.get(cwKey);

    if (cwEntry) {

      cwEntry.senses.push(...mdEntry.senses);
      cwEntry.definition += ';; ';
      cwEntry.definition += mdEntry.senses
      .map(({ definition }) => definition)
      .join(';; ');

      mergedEntries.push([cwEntry, mdEntry]);

    } else {

      cwEntries.set(cwKey, mdEntry);

    }

  }

  // Uncomment to see merged entries.
  // console.log(mergedEntries);

  // add unmapped entries to unique entries
  for (const [, cwEntry] of cwEntries) {
    uniqueEntries.set(createMDKey(cwEntry), cwEntry);
  }

  const dbEntries = Array.from(uniqueEntries.values());

  if (!silent) {
    console.info('\n');
    /* eslint-disable sort-keys */
    console.table({
      'Records to parse':  records.length,
      'Records converted': entries.length,
      'Duplicate records': duplicateRecords,
      'Total mappings':    totalMappings,
      'Mapped entries':    numMapped,
      'Entries merged':    mergedEntries.length,
      'Total entries':     dbEntries.length,
    });
  }

  if (outputPath) await writeEntries(outputPath, dbEntries);

  return dbEntries;

}
