import ProgressBar           from 'progress';
import createCSVStream       from 'csv-parse';
import createTransformStream from 'stream-transform';
import ndjson                from 'ndjson';

import {
  createReadStream,
  createWriteStream,
  promises as fsPromises,
} from 'fs';

const { stat } = fsPromises;

/**
 * Extracts certain kinds of information from the definition and updates the Sense and Lexeme objects as appropriate.
 * @param  {String} definition The definition to parse (Sense.definition).
 * @param  {Object} sense      The Sense object.
 * @param  {Object} entry      The Lexeme (Entry) object.
 */
function processDefinition(definition, sense, entry) {

  const hasAnimacyInfo = /animate/iu.test(definition);

  if (hasAnimacyInfo) {

    entry.features         = entry.features ?? {};
    entry.features.animate = !/inanimate/iu.test(definition);

    const basicAnimacyRegExp         = /(?<punctuation>[.!?])\s+(?:in)?animate\.\s*/giu;
    const parentheticalAnimacyRegExp = /\s*\((?:in)?animate\)\s*/giu;

    sense.definition = sense.definition
    .replace(basicAnimacyRegExp, `$<punctuation>`)
    .replace(parentheticalAnimacyRegExp, ``);

  }

}

/**
 * Splits a string into senses based on sense numbers (1., 2. etc.).
 * @param  {String} definition The string to split.
 * @return {Array}             Returns an array of definitions, even when only one sense/definition is present.
 */
function getSenses(definition) {
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
function processSemanticDomains(rapidWordsClasses) {
  return rapidWordsClasses.split(/;\s*/u);
}

/**
 * The handler passed to the transform stream to transform data before passing it to the JSON stream for writing to the JSON file.
 * @param  {Object} data The raw CSV data, as an object (column headers are property names).
 * @return {Object}      Returns the modified data for writing to the JSON file.
 */
function transform({
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
    semanticDomains: processSemanticDomains(RapidWordsClasses),
    semanticIndices: processSemanticDomains(RapidWordIndices),
  };

  const senses = getSenses(MeaningInEnglish)
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

  senses.forEach(sense => processDefinition(sense.definition, sense, entry));

  return entry;

}

export default async function convertCW(inputPath, outputPath) {

  // validate arguments
  if (!inputPath) {
    throw new Error(`Please provide the path to the Maskwacîs database as the first argument.`);
  }

  if (!outputPath) {
    throw new Error(`Please provide the path where you would like the converted file generated as the second argument`);
  }

  // create command line progress bar
  const { size: fileSize } = await stat(inputPath);
  const progressBar        = new ProgressBar(`:bar :percent :eta`, { total: fileSize });

  await new Promise((resolve, reject) => {

    // create streams
    const csvOptions = {
      columns:   true,
      delimiter: `\t`,
      relax:     true,
    };

    const readStream      = createReadStream(inputPath);
    const csvStream       = createCSVStream(csvOptions);
    const transformStream = createTransformStream(transform);
    const jsonStream      = ndjson.stringify();
    const writeStream     = createWriteStream(outputPath);

    // subscribe to various stream events
    // NOTE: Stream errors are **not** forwarded to next stream in the pipe.
    readStream.on(`data`, chunk => progressBar.tick(chunk.length > fileSize ? fileSize : chunk.length));
    readStream.on(`error`, err => {
      console.error(`Error in read stream:`);
      reject(err);
    });
    csvStream.on(`error`, err => {
      console.error(`Error in CSV stream:`);
      reject(err);
    });
    jsonStream.on(`error`, err => {
      console.error(`Error in JSON stream:`);
      reject(err);
    });
    writeStream.on(`close`, () => {
      console.info(`Finished converting the Maskwacîs database.\n`);
      resolve();
    });
    writeStream.on(`error`, err => {
      console.error(`Error in write stream:`);
      reject(err);
    });

    // start the streams
    console.info(`\nConverting the Maskwacîs database.`);

    readStream
    .pipe(csvStream)
    .pipe(transformStream)
    .pipe(jsonStream)
    .pipe(writeStream);

  });

}
