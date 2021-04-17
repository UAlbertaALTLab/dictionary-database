/**
 * This script exports a single function `importCW` which imports the CW database into the ALTLab database.
 */

import { dirname as getDirname } from 'path';
import loadEntries               from '../utilities/loadEntries.js';
import saveDatabase              from '../utilities/saveDatabase.js';
import setKeys                   from '../utilities/setKeys.js';

/**
 * A class representing an ALTLab database entry (a DLx Lexeme object). Created from a CW entry.
 */
class DBEntry {

  /**
   * Create a new ALTLab entry.
   * @param {Object} CW_entry The CW entry to create the ALTLab entry from.
   */
  constructor({
    definition,
    dialects,
    lemma,
    senses,
  }) {

    this.dialects = dialects;

    this.lemma = {
      plains: lemma.plains,
      sro:    lemma.sro,
    };

    this.senses = senses.map(sense => Object.assign({}, sense));
    this.senses.forEach(sense => { sense.dataSource = 'CW'; });

    this.alternativeAnalyses = [
      {
        definition,
        dialects,
        lemma,
        senses,
      },
    ];

  }

}

/**
 * A class for construction a map of lemmas / headwords to entries.
 * @extends Map
 */
class LemmaMap extends Map {

  /**
   * Create a new Lemma Map.
   * @param {Array} entries The Array of entries to turn into a Map.
   */
  constructor(entries) {

    super();

    for (const entry of entries) {

      const existingEntry = this.get(entry.lemma.sro);

      if (existingEntry) {
        if (Array.isArray(existingEntry)) existingEntry.push(entry);
        else this.set(entry.lemma.sro, [existingEntry, entry]);
      } else {
        this.set(entry.lemma.sro, entry);
      }

    }

  }
}

/**
 * Imports the CW database into the ALTLab database.
 * @param  {String}         cwPath              The path to the CW database in NDJSON format.
 * @param  {String}         databasePath        The path to the ALTLab database. The updated version of the database will be saved in the same directory.
 * @param  {Object}         [options={}]        An options hash.
 * @param  {Boolean}        [options.hash=true] Whether to include the version hash in the database filename.
 * @return {Promise<Array>}                     Returns a Promise that resolves to the Array of ALTLab database entries after they have been written to the database.
 */
export default async function importCW(cwPath, databasePath, { hash = true } = {}) {

  const cw     = await loadEntries(cwPath);
  const db     = await loadEntries(databasePath);
  const lemmas = new LemmaMap(db);

  for (const cwEntry of cw) {

    const matchingLemmas = lemmas.get(cwEntry.lemma.sro);

    // No match found - create a new entry
    if (!matchingLemmas) {
      const dbEntry = new DBEntry(cwEntry);
      lemmas.set(dbEntry.lemma.sro, dbEntry);
      continue;
    }

    // Single match found - update the existing entry
    if (!Array.isArray(matchingLemmas)) {
      // TODO: Update the CW entry in `alternativeAnalyses`,
      // then continue to next record.
    }

    // Multiple matches found - determine which entry is closest and update it
    // TODO: Use the POS field to resolve the correct entry
    // Update that entry, then continue to next record.

    // TODO: Check for any remaining cases.
    // Look at why they were missed and update script accordingly.
    // Remove the continue statement from the previous block if no extra code is needed here.

  }

  const databaseDir = getDirname(databasePath);
  const entries     = Array.from(lemmas.values()).flat();

  setKeys(entries);
  await saveDatabase(databaseDir, entries, { hash: false });

  return db;

}
