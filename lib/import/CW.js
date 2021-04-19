/**
 * This script exports a single function `importCW` which imports the CW database into the ALTLab database.
 */

import loadEntries  from '../utilities/loadEntries.js';
import saveDatabase from '../utilities/saveDatabase.js';
import setKeys      from '../utilities/setKeys.js';

/**
 * Create a unique key for a CW entry.
 * @param  {Object} cwEntry The CW entry to create a key for.
 * @return {String}
 */
function createCWKey({ definition, lemma, pos }) {
  return `${ lemma.sro }:${ pos }:${ definition }`;
}

/**
 * A class for an ALTLab database entry.
 */
class DBEntry {

  /**
   * Create a new database entry from a CW entry.
   * @param {Object} CW_entry The CW entry to create the database entry from.
   */
  constructor(cwEntry) {

    cwEntry.matched = true;

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
 * A class for constructing a Map of database entries using CW-specific keys.
 * @extends Map
 */
class KeyMap extends Map {
  /**
   * Create a new KeyMap.
   * @param {Array} entries The Array of entries to turn into a Map.
   */
  constructor(entries) {

    super();

    for (const entry of entries) {
      const cwEntry = entry.dataSources.CW;
      const key = createCWKey(cwEntry);
      this.set(key, entry);
    }

  }
}

/**
 * Imports the CW database into the ALTLab database.
 * @param  {String}         cwPath       The path to the CW database in NDJSON format.
 * @param  {String}         databasePath The directory where the ALTLab database is stored. The file must be named `database.ndjson` or `database-{hash}.ndjson`. The updated version of the database will be saved in the same directory.
 * @return {Promise<Array>}              Returns a Promise that resolves to the Array of ALTLab database entries after they have been written to the database.
 */
/* eslint-disable max-statements */
export default async function importCW(cwPath, databasePath) {

  const db                   = await loadEntries(databasePath);
  const cw                   = await loadEntries(cwPath);
  const index                = new KeyMap(db);
  const originalDatabaseSize = db.length;
  let   entriesAdded         = 0;
  let   entriesDeleted       = 0;

  // Keep track of which existing CW subentries in the database have been
  // matched to an entry in the current CW database being imported.
  for (const dbEntry of db) {
    dbEntry.dataSources.CW.matched = false;
  }

  for (const cwEntry of cw) {

    const key     = createCWKey(cwEntry);
    const dbEntry = index.get(key);

    if (dbEntry) {
      cwEntry.matched        = true;
      dbEntry.dataSources.CW = cwEntry;
      continue;
    }

    index.set(key, new DBEntry(cwEntry));
    entriesAdded++;

  }

  const entries = Array.from(index.values())
  .map(entry => {

    if (entry.dataSources.CW.matched) {
      // remove unnecessary properties from subentries
      delete entry.dataSources.CW.key;
      delete entry.dataSources.CW.matched;
    } else {
      // remove CW data sources that were never matched
      // (this means they no longer exist in the original CW database)
      delete entry.dataSources.CW;
    }

    return entry;

  })
  // remove database entries without data sources
  .filter(entry => {

    if (Object.keys(entry.dataSources).length) {
      return true;
    }

    entriesDeleted++;
    return false;

  });

  setKeys(entries);

  /* eslint-disable sort-keys */
  console.table({
    'Entries to import':                cw.length,
    'Size of database prior to import': originalDatabaseSize,
    'Size of database after import':    entries.length,
    'Entries deleted':                  entriesDeleted,
    'Entries added':                    entriesAdded,
    'Net change in database size':      entries.length - originalDatabaseSize,
  });

  await saveDatabase(databasePath, entries);

  return db;

}
