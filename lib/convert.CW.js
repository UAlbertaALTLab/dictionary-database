/* eslint-disable
  no-param-reassign,
*/

import convert from '@digitallinguistics/toolbox2json';

// Stores a running unique list of all the known entry keys (used for determining homograph numbers).
const keys = new Set;

/**
 * The mappings table is passed to the @digitallinguistics/toolbox2json library as an option. It contains mappings from Toolbox line codes to JSON property names.
 * @type {Object}
 */
const mappings = {
  def: `definition`,
  dl:  `dialects`,
  syl: `syllabics`,
};

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
 * Add a note to an object's "notes" array.
 * @param {Object} note   The Note object to add
 * @param {Object} object The object to add the note to
 */
function addNote(note, object) {
  object.notes = object.notes ?? [];
  object.notes.push(note);
}

/**
 * Accepts a definition and returns an object with "definition" and "parenthetical" properties. The definition will have the text of the parenthetical stripped from it.
 * @param  {String} definition The definitition to extract parentheticals from.
 * @return {Object}            Returns an object with "definition" and "parenthetical" properties. "parenthetical" may be undefined.
 */
function extractParenthetical(definition) {

  const parentheticalRegExp = /^(?<textBefore>.*)\[(?<parenthetical>.+)\](?<textAfter>.*)/u;
  const parentheticalMatch  = definition.match(parentheticalRegExp);

  if (!parentheticalMatch) return { definition };

  const { parenthetical, textBefore, textAfter } = parentheticalMatch.groups;
  definition = [textBefore, textAfter].join(``);

  return {
    definition:    [textBefore, textAfter].map(str => str.trim()).join(``),
    parenthetical: parenthetical.trim(),
  };

}

/**
 * Splits the original definition into multiple definitions based on semicolons, while taking into account that parentheticals may contain semicolons as well.
 * @param  {String} [input=``] The original definition from the Toolbox file
 * @return {Array}             Returns an Array of definitions.
 */
function getDefinitions(input) {

  if (!input) return [];

  const chunks            = input.split(`;`).map(str => str.trim());
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

  }, []);

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
 * This function is passed to the @digitallinguistics/toolbox2json library as an option. It accepts the entry object as an argument, and makes any final transformations to the data before that entry is written to the JSON file.
 * @param  {Object} entry The entry to modify
 * @return {Object}       Returns the modified entry
 */
function postprocessor({
  definition,
  dialects,
  sro,
  syllabics,
  test,
}) {

  let key          = createKey(sro);
  let homographNum = 1;
  let homographKey = key + homographNum;

  const checkKey = () => {
    if (keys.has(homographKey)) {
      homographNum++;
      homographKey = key + homographNum;
      checkKey();
    }
  };

  checkKey();
  keys.add(homographKey);
  if (homographNum > 1) key = homographKey;

  const entry = {
    definition,
    dialects,
    key,
    lemma: {
      sro,
      syll: syllabics,
    },
    senses: [],
    test,
  };

  return processDefinition(entry);

}

/**
 * Extract a cross-reference from a string and save it to the entry
 * @param  {String} noteText The text of the note
 * @param  {Object} entry    The Lexeme object associated with this note
 * @param  {Object} sense    The Sense object associated with this note
 */
function processCrossReference(noteText, entry, sense) {

  const crossRefRegExp = /(?<relationType>see|cf\.)\s(?<crossRefText>.+)\s*$/u;
  const match          = noteText.match(crossRefRegExp);

  if (!match) return;

  const { crossRefText, relationType } = match.groups;

  // if the cross-reference text is multiple words, we can't assume it's a headword
  // save it as a general note instead
  // otherwise treat it as a headword and save it as a cross-reference lexical relation
  if (hasWhitespace(crossRefText)) {

    const note = {
      noteType: `general`,
      text:     noteText,
    };

    addNote(note, entry);

  } else {

    const crossReference = {
      key:      createKey(crossRefText),
      lemma:    { sro: crossRefText },
      relation: relationType === `see` ? `crossReference` : `compare`,
    };

    entry.lexicalRelations = entry.lexicalRelations ?? [];
    entry.lexicalRelations.push(crossReference);

  }

  removeUnusedDefinition(noteText, entry, sense);

}

/**
 * Extracts any parentheticals and other notes from the definition and moves them to other fields as appropriate.
 * @param  {Object} entry The Lexeme object, with a "definition" field containing Arok's original definition, verbatim.
 * @return {Object}       Returns the modified entry.
 */
function processDefinition(entry) {

  // Structure of Definitions
  // ====
  // Definitions may contain multiple parentheticals, in [brackets].
  // Parentheticals may themselves contain multiple notes, separated by semicolons.
  // Some notes are associated with the entire entry.
  // Other notes are associated with the particular definition they're in.

  // split original definition into individual senses
  entry.senses = getDefinitions(entry.definition)
  .map(definition => ({ definition }));

  entry.senses.forEach(sense => {

    // extract any parentheticals from the definitions
    const { definition, parenthetical } = extractParenthetical(sense.definition);

    sense.definition = definition;

    if (parenthetical) {
      const notes = parenthetical.split(`;`).map(str => str.trim());
      notes.forEach(note => processNote(note, entry, sense));
    }

    // also extract any definitions that are actually unbracketed parentheticals
    processNote(sense.definition, entry, sense);

  });

  // remove any senses with empty definitions
  entry.senses = entry.senses.filter(({ definition }) => definition);

  return entry;

}

/**
 * Reformats the "dialects" property.
 * @param  {String|Array} input A string containing one of Arok's dialect codes, or an Array of such strings.
 * @return {Array}              Returns an array of Glottocodes.
 */
function processDialects(input) {

  const dialects = Array.isArray(input) ? input : [input];

  return dialects.map(dialect => {
    if (dialect.includes(`npC`)) return `nort2960`;
    if (dialect.includes(`pC`)) return `plai1258`;
    if (dialect.includes(`sC`)) return `swam1239`;
    if (dialect.includes(`wC`)) return `wood1236`;
    return `unknown`;
  });

}

/**
 * Extract the note and save it to the sense
 * @param  {String} noteText
 * @param  {Object} entry
 * @param  {Object} sense
 */
function processGeneralNote(noteText, entry, sense) {

  // if you're looking at a plain definition, do nothing
  if (noteText === sense.definition) return;

  // otherwise, add a general note
  const note = {
    noteType: `general`,
    text:     noteText,
  };

  // if definition is empty, add note to entry
  // otherwise add it to the sense
  addNote(note, sense.definition ? sense : entry);

}

/**
 * Extract the Latin term and save it to the sense
 * @param  {String} noteText
 * @param  {Object} entry
 * @param  {Object} sense
 */
function processLatinTerm(noteText, entry, sense) {

  const latinTermRegExp = /^(?:Lt[:.]|Latin:?)\s+(?<scientificName>.+)\s*$/u;
  const match           = noteText.match(latinTermRegExp);

  if (!match) return;

  sense.scientificName = match.groups.scientificName;

  removeUnusedDefinition(noteText, entry, sense);

}

/**
 * Extract the literal definition from a note and save it to the entry
 * @param  {String} noteText The text of the note
 * @param  {Object} entry    The Lexeme object associated with this note
 * @param  {Object} sense    The Sense object associated with this note
 */
function processLiteralDefinition(noteText, entry, sense) {

  const literalDefinitionRegExp = /^(?:lit[:.]{1,2}|literally:?)\s+(?<literalDefinition>.+)\s*$/u;
  const match                   = noteText.match(literalDefinitionRegExp);

  if (!match) return;

  let { literalDefinition } = match.groups;

  // remove leading and trailing quotes
  literalDefinition = literalDefinition
  .replace(/^['"]/u, ``)
  .replace(/['"]$/u, ``);

  entry.literalMeaning = literalDefinition;

  removeUnusedDefinition(noteText, entry, sense);

}

/**
 * Determines the type of note, and adds the information to either the entry or the sense as appropriate.
 * @param  {String} noteText The text of the note (parenthetical)
 * @param  {Object} entry    The Lexeme object associated with this note
 * @param  {Object} sense    The Sense object associated with this note
 */
function processNote(...args) {
  processCrossReference(...args);
  processLiteralDefinition(...args);
  processLatinTerm(...args);
  processUsageNote(...args);
  processGeneralNote(...args);
}

/**
 * Extract the usage note and save it to the sense
 * @param  {String} noteText
 * @param  {Object} entry
 * @param  {Object} sense
 */
function processUsageNote(noteText, entry, sense) {

  const usageRegExp = /^(?<usage>.+):$/u;
  const match       = noteText.match(usageRegExp);

  if (!match) return;

  const { usage } = match.groups;

  sense.usages = sense.usages ?? [];
  sense.usages.push(usage.trim());

  removeUnusedDefinition(noteText, entry, sense);

}

/**
 * Checks to see whether the noteText is actually the current definition, and removes the sense from the entry if so.
 * @param  {String} noteText
 * @param  {Object} entry
 * @param  {Object} sense
 */
function removeUnusedDefinition(noteText, entry, sense) {

  const isDefinition = noteText === sense.definition;

  if (isDefinition) {
    const i = entry.senses.findIndex(s => s.definition === noteText);
    entry.senses.splice(i, 1);
  }

}

export default async function convertCW(inputPath, outputPath) {

  if (!inputPath) {
    throw new Error(`Please provide the path to the CW database as the first argument.`);
  }

  if (!outputPath) {
    throw new Error(`Please provide the path where you would like the converted file generated as the second argument`);
  }

  await convert(inputPath, {
    mappings,
    ndjson:     true,
    out:        outputPath,
    parseError: `object`,
    postprocessor,
    transforms: {
      dl: processDialects,
    },
  });

}
