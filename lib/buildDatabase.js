/**
 * Builds the entire ALTLab database from scratch. Converts each data source, imports them into the database, and aggregates the entries.
 */

/* eslint-disable
  max-statements,
*/

import clearDatabase     from './utilities/clearDatabase.js';
import convertCW         from './convert/CW.js';
import convertMD         from './convert/MD.js';
import createSpinner     from 'ora';
import { fileURLToPath } from 'url';
import importCW          from './import/CW.js';
import importMD          from './import/MD.js';

import {
  dirname as getDirname,
  join    as joinPath,
} from 'path';

const __dirname  = getDirname(fileURLToPath(import.meta.url));

export default async function buildDatabase() {

  const dataDir      = joinPath(__dirname, '../data');
  const cwInputPath  = joinPath(dataDir, 'Wolvengrey.toolbox');
  const mdInputPath  = joinPath(dataDir, 'Maskwacis.tsv');
  const cwDataPath   = joinPath(dataDir, 'CW.ndjson');
  const mdDataPath   = joinPath(dataDir, 'MD.ndjson');
  const mappingsPath = joinPath(dataDir, 'MD-CW-mappings.tsv');
  const databasePath = joinPath(dataDir, 'database.ndjson');

  const clearDatabaseSpinner = createSpinner('Clearing database.').start();
  await clearDatabase();
  clearDatabaseSpinner.succeed('Database cleared.');

  const convertCWSpinner = createSpinner('Converting CW database.').start();
  await convertCW(cwInputPath, cwDataPath);
  convertCWSpinner.succeed('CW database converted.');

  const convertMDSpinner = createSpinner('Converting MD database.').start();
  await convertMD(mdInputPath, mdDataPath, mappingsPath);
  convertMDSpinner.succeed('MD database converted.');

  const importMDSpinner = createSpinner('Importing MD database.').start();
  await importMD(mdDataPath, databasePath);
  importMDSpinner.succeed('MD database imported.');

  const importCWSpinner = createSpinner('Importing CW database.').start();
  await importCW(cwDataPath, databasePath);
  importCWSpinner.succeed('CW database imported.');

}
