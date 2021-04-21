/**
 * Imports the CW entries into the ALTLab database.
 */

import Index              from '../utilities/DatabaseIndex.js';
import createHomographKey from '../utilities/createHomographKey.js';
import loadEntries        from '../utilities/loadEntries.js';
import saveDatabase       from '../utilities/saveDatabase.js';

/**
 * A class for an ALTLab database entry.
 */
class DBEntry {

  /**
   * Create a new database entry from a CW entry.
   * @param {Object} cwEntry The CW entry to create the database entry from.
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
 * Imports the CW database into the ALTLab database.
 * @param  {String}         cwPath       The path to the CW database in NDJSON format.
 * @param  {String}         databasePath The path to the ALTLab database file.
 * @return {Promise<Array>}              Returns a Promise that resolves to the Array of ALTLab database entries after they have been written to the database.
 */
/* eslint-disable max-statements */
export default async function importCW(cwPath, databasePath, { silent = false } = {}) {

  const db                   = await loadEntries(databasePath);
  const cw                   = await loadEntries(cwPath);
  let   entriesAdded         = 0;
  let   entriesDeleted       = 0;

  const primaryIndex = new Index(db, (entry, index) => createHomographKey(entry.lemma.sro, index));
  const sroIndex     = new Index(db, entry => `${ entry.lemma.sro }:${ entry.key }`);
  const sroKeys      = Array.from(sroIndex.keys());

  const cwIndex = new Index(db, ({ dataSources: { CW: cwEntry } }) => {
    if (cwEntry) return `${ cwEntry.lemma.sro }:${ cwEntry.pos }:${ cwEntry.definition }`;
  });

  const mappingsIndex = new Index(db, ({ dataSources: { MD: mdEntry } }) => {
    if (!mdEntry) return;
    const { mapping } = mdEntry;
    if (mapping) return `${ mapping.lemma_CW }:${ mapping.definition_CW }`;
  });

  // Keep track of which existing CW subentries in the database have been
  // matched to an entry in the current CW database being imported.
  for (const [, cwEntry] of cwIndex) {
    cwEntry.matched = false;
  }

  let cwIndexMatches  = 0;
  let mappingsMatches = 0;
  let lemmaMatches    = 0;

  // Match each entry in the CW database to an existing ALTLab entry,
  // or create a new entry in the ALTLab database.
  for (const cwEntry of cw) {

    // attempt to match CW entry with an existing database entry using lemma + POS + definition
    let dbEntry = cwIndex.get(`${ cwEntry.lemma.sro }:${ cwEntry.pos }:${ cwEntry.definition }`);
    if (dbEntry) cwIndexMatches++;

    // if no match is found, attempt to find an ALTLab entry by using the MD > CW mappings
    if (!dbEntry) {
      dbEntry = mappingsIndex.get(`${ cwEntry.lemma.sro }:${ cwEntry.definition }`);
      if (dbEntry) mappingsMatches++;
    }

    // if there's still no match, attempt to find an ALTLab entry by lemma alone
    if (!dbEntry) {
      const matchedKey = sroKeys.find(key => key.startsWith(cwEntry.lemma.sro));
      dbEntry          = sroIndex.get(matchedKey);
      if (dbEntry) lemmaMatches++;
    }

    // If there's a matching ALTLab entry, update it.
    if (dbEntry) {
      cwEntry.matched        = true;
      dbEntry.dataSources.CW = cwEntry;
      continue;
    }

    // If there's not a matching ALTLab entry, create one
    // and add it to both indexes.
    const newEntry = new DBEntry(cwEntry);
    primaryIndex.add(newEntry);
    cwIndex.add(newEntry);
    entriesAdded++;

  }

  // clean up CW subentries
  for (const [key, dbEntry] of cwIndex) {

    const cwEntry = dbEntry.dataSources.CW;

    if (cwEntry.matched) {
      // remove unnecessary properties from the subentry
      delete cwEntry.key;
      delete cwEntry.matched;
    } else {
      // remove CW data sources that were never matched
      // (this means they no longer exist in the original CW database)
      delete dbEntry.dataSources.CW;
      cwIndex.remove(key);
    }

  }

  // Set the "key" property of any entries that are missing it.
  // AND Remove database entries without data sources.
  for (const [key, dbEntry] of primaryIndex) {

    if (Object.keys(dbEntry.dataSources).length) {
      dbEntry.key = key;
      continue;
    }

    primaryIndex.remove(key);
    entriesDeleted++;

  }

  const entries = Array.from(primaryIndex.values());

  if (!silent) {
    /* eslint-disable sort-keys */
    console.info(`\n`);
    console.table({
      'Entries to import':                              cw.length,
      'Size of database prior to import':               db.length,
      'Entries matched by CW lemma + POS + definition': cwIndexMatches,
      'Entries matched by MD > CW mappings':            mappingsMatches,
      'Entries matched by lemma':                       lemmaMatches,
      'Entries matched (total)':                        cw.length - entriesAdded,
      'Entries deleted':                                entriesDeleted,
      'Entries added':                                  entriesAdded,
      'Net change in database size':                    entries.length - db.length,
      'Size of database after import':                  entries.length,
    });
  }

  await saveDatabase(databasePath, entries, { silent });

  return entries;

}
