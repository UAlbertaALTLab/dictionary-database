/**
 * Imports the MD entries into the ALTLab database.
 */

import Index              from '../utilities/DatabaseIndex.js';
import createHomographKey from '../utilities/createHomographKey.js';
import createMDKey        from '../utilities/createMDKey.js';
import loadEntries        from '../utilities/loadEntries.js';
import saveDatabase       from '../utilities/saveDatabase.js';

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
      sro: mdEntry.mapping?.lemma_CW ?? mdEntry.lemma.md,
    };

    this.senses = mdEntry.senses
    .map(sense => Object.assign({}, sense, { dataSource: 'MD' }));

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

  const db             = await loadEntries(databasePath);
  const md             = await loadEntries(mdPath);
  let   entriesAdded   = 0;
  let   entriesDeleted = 0;

  const primaryIndex = new Index(db, (entry, index) => createHomographKey(entry.lemma.sro, index));
  const mdIndex      = new Index(db, ({ dataSources: { MD: mdEntry } }) => {
    if (mdEntry) return createMDKey(mdEntry);
  });

  // Keep track of which existing MD subentries in the database have been
  // matched to an entry in the current MD database being imported.
  for (const [, mdEntry] of mdIndex) {
    mdEntry.matched = false;
  }

  // Match each entry in the MD database to an existing ALTLab entry,
  // or create a new entry in the ALTLab database.
  for (const mdEntry of md) {

    const key     = createMDKey(mdEntry);
    const dbEntry = mdIndex.get(key);

    // If there's a matching ALTLab entry, update it.
    if (dbEntry) {
      mdEntry.matched        = true;
      dbEntry.dataSources.MD = mdEntry;
      continue;
    }

    // If there's not a matching ALTLab entry, create one
    // and add it to both indexes.
    const newEntry = new DBEntry(mdEntry);
    primaryIndex.add(newEntry);
    mdIndex.add(newEntry);
    entriesAdded++;

  }

  // clean up MD subentries
  for (const [key, dbEntry] of mdIndex) {

    const mdEntry = dbEntry.dataSources.MD;

    if (mdEntry.matched) {
      // remove unnecessary properties from subentry
      delete mdEntry.key;
      delete mdEntry.matched;
    } else {
      // remove MD data sources that were never matched
      // (this means they no longer exist in the original MD database / mappings table)
      delete dbEntry.dataSources.MD;
      mdIndex.remove(key);
    }

  }

  // Set the "key" property of any entries that are missing it.
  // Remove database entries without data sources.
  for (const [key, dbEntry] of primaryIndex) {

    if (Object.keys(dbEntry.dataSources).length) {
      dbEntry.key = key;
      continue;
    }

    primaryIndex.remove(key);
    entriesDeleted++;

  }

  const entries = Array.from(primaryIndex.values());

  /* eslint-disable sort-keys */
  console.info(`\n`);
  console.table({
    'Size of database prior to import': db.length,
    'Entries to import':                md.length,
    'Entries deleted':                  entriesDeleted,
    'Entries added':                    entriesAdded,
    'Size of database after import':    entries.length,
    'Net change in database size':      entries.length - db.length,
  });

  await saveDatabase(databasePath, entries);

  return db;

}
