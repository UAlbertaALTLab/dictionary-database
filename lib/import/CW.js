/**
 * This script exports a single function `importCW` which imports the CW database into the ALTLab database.
 */

import { dirname as getDirname } from 'path';
import loadEntries               from '../utilities/loadEntries.js';
import saveDatabase              from '../utilities/saveDatabase.js';
import setKeys                   from '../utilities/setKeys.js';

/**
 * A class for an ALTLab database entry.
 */
class DBEntry {

  /**
   * Create a new database entry from a CW entry.
   * @param {Object} CW_entry The CW entry to create the database entry from.
   */
  constructor(cwEntry) {

    this.dataSources = {
      CW: cwEntry,
    };

    this.dialects = cwEntry.dialects;

    this.lemma = {
      plains: cwEntry.lemma.plains,
      sro:    cwEntry.lemma.sro,
    };

    this.senses = cwEntry.senses
    .map(sense => Object.assign({}, sense, { dataSource: 'CW' }));

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
/* eslint-disable max-statements */
export default async function importCW(cwPath, databasePath, { hash = true } = {}) {

  const cw     = await loadEntries(cwPath);
  const db     = await loadEntries(databasePath);
  const lemmas = new LemmaMap(db);

  // TODO: Check for CW entries that have BOTH the same \sro and \ps fields.
  // known duplicate (different POS): kaskikwâtêw

  for (const cwEntry of cw) {

    const match = lemmas.get(cwEntry.lemma.sro);

    // No matching database entry found - create a new entry
    if (!match) {
      const newEntry = new DBEntry(cwEntry);
      lemmas.set(newEntry.lemma.sro, newEntry);
      continue;
    }

    // Single matching database entry found
    if (!Array.isArray(match)) {

      if (cwEntry.pos === match.dataSources.CW.pos) {
        // Database entry refers to the current CW entry - update the CW entry
        match.dataSources.CW = cwEntry;
      } else {
        // Database entry refers to a different CW entry (a homograph) - create a new database entry
        const newEntry = new DBEntry(cwEntry);
        lemmas.set(newEntry.lemma.sro, [match, newEntry]);
      }

      continue;

    }

    // Multiple matches found - determine which entry is closest and update it
    // TODO: Use the POS field to resolve the correct entry
    // Update that entry, then continue to next record.

  }

  const databaseDir = getDirname(databasePath);
  const entries     = Array.from(lemmas.values()).flat();

  setKeys(entries);
  await saveDatabase(databaseDir, [], { hash: false });

  return db;

}
