/**
 * Imports the MD entries into the ALTLab database.
 */

import loadEntries  from '../utilities/loadEntries.js';
import saveDatabase from '../utilities/saveDatabase.js';
import setKeys      from '../utilities/setKeys.js';

/**
 * Create a unique key for an MD entry.
 * @param  {Object} mdEntry The MD entry to create a key for.
 * @return {String}
 */
function createMDKey({ definition, lemma, mapping }) {
  return `${ mapping?.lemma_CW ?? lemma.sro }:${ definition }`;
}

/**
 * A class for an ALTLab database entry.
 */
class DBEntry {

  /**
   * Create a new ALTLab database entry from an MD entry.
   * @param {Object} mdEntry The MD entry to create the database entry from.
   */
  constructor(mdEntry) {

    mdEntry.matched = true;

    this.dataSources = {
      MD: mdEntry,
    };

    this.lemma = {
      sro: mdEntry.mapping?.lemma_CW ?? mdEntry.lemma.sro,
    };

    this.senses = mdEntry.senses
    .map(sense => Object.assign({}, sense, { dataSource: 'MD' }));

  }

}

/**
 * A class representing a Map of MD-specific database keys (basically an index).
 * @extends Map
 */
class KeyMap extends Map {

  /**
   * Create a new KeyMap / database index.
   * @param {Array} entries The Array of database entries to index.
   */
  constructor(dbEntries) {

    super();

    for (const dbEntry of dbEntries) {

      const mdEntry = dbEntry.dataSources.MD;

      if (mdEntry) {
        const key = createMDKey(mdEntry);
        this.set(key, dbEntry);
      }

    }

  }

}

/**
 * Imports the MD entries into the ALTLab database.
 * @param  {String}  mdPath       The path to the MD NDJSON file.
 * @param  {String}  databasePath The path to the ALTLab database.
 * @return {Promise}              Returns a Promise that resolves to the Array of ALTLab database entries.
 */
/* eslint-disable max-statements */
export default async function importMD(mdPath, databasePath) {

  const db                   = await loadEntries(databasePath);
  const md                   = await loadEntries(mdPath);
  const originalDatabaseSize = db.length;
  let   entriesAdded         = 0;
  let   entriesDeleted       = 0;

  const index = new KeyMap(db);

  // Keep track of which existing MD subentries in the database have been
  // matched to an entry in the current MD database being imported.
  for (const dbEntry of db) {
    const mdEntry = dbEntry.dataSources.MD;
    if (mdEntry) mdEntry.matched = false;
  }

  for (const mdEntry of md) {

    const key     = createMDKey(mdEntry);
    const dbEntry = index.get(key);

    if (dbEntry) {
      mdEntry.matched        = true;
      dbEntry.dataSources.MD = mdEntry;
      continue;
    }

    index.set(key, new DBEntry(mdEntry));
    entriesAdded++;

  }

  const entries = Array.from(index.values())
  .map(entry => {

    if (entry.dataSources.MD?.matched) {
      // remove unnecessary properties from subentries
      delete entry.dataSources.MD.key;
      delete entry.dataSources.MD.matched;
    } else {
      // remove CW data sources that were never matched
      // (this means they no longer exist in the original CW database)
      delete entry.dataSources.MD;
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
  console.info(`\n`);
  console.table({
    'Entries to import':                md.length,
    'Size of database prior to import': originalDatabaseSize,
    'Size of database after import':    entries.length,
    'Entries deleted':                  entriesDeleted,
    'Entries added':                    entriesAdded,
    'Net change in database size':      entries.length - originalDatabaseSize,
  });

  await saveDatabase(databasePath, entries);

  return db;

}
