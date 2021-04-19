# Plains Cree Dictionary Database Management

The repository contains scripts and documentation for managing the multiple data sources for [ALTLab's][ALTLab] [Plains Cree][Cree] dictionary, which can be viewed online [here][itwewina]. This repository does _not_ (and should not) contain the actual data.

The database uses the [Data Format for Digital Linguistics][DaFoDiL] (DaFoDiL) as its underlying data format, a set of recommendations for storing linguistic data in JSON.

## Contents

<!-- TOC -->
- [Sources](#sources)
- [Project Requirements](#project-requirements)
- [Process](#process)
- [Style Guide](#style-guide)
- [The Database](#the-database)
- [Building the Database](#building-the-database)
- [Tests](#tests)
<!-- /TOC -->

## Sources

ALTLab's dictionary database is / will be aggregated from the following sources:

* [Arok Wolvengrey][Arok]'s [_nêhiyawêwin: itwêwina / Cree: Words_][CW] (`CW`)
  - This is a living source.
* [Maskwacîs][Maskwacis] [_Nehiyawêwina Pîkiskwewinisa / Dictionary of Cree Words_][MD] (`MD`)
  - This a living source.
* _Alberta Elders' Cree Dictionary_ (`AECD` or `AE` or `ED`)
  - This is a static source.
* [Albert Lacombe][Lacombe]'s _Dictionnaire de la langue des Cris_ (`DLC`)
  - This will be a static source.
* _The Student's Dictionary of Literary Plains Cree, Based on Contemporary Texts_
  - This source has already been integrated into _Cree: Words_.

Another important data source is @katieschmirler's mappings from MD entries to CW entries.

## Project Requirements

* The field data from the original dictionaries should be retained in its original form, and preferably even incorporated into ALTLab's database in an unobtrusive way.

* The order that sources are imported should be commutative (i.e. irrelevant; the script should output the same result regardless of the order the databases are imported).

* Manual input should not be required for aggregating entries. Entries can however be flagged for manual inspection.

## Process

At a high level, the process for aggregating the sources is as follows:

1. **convert** data source from original format to [DaFoDiL][DaFoDiL]
2. **clean** and normalize the data (partially handled during Step 1), while retaining the original data
3. **import** the data into ALTLab's database using an aggregation algorithm
4. create the **sqlite3** database
5. create the **FST** LEXC files

## Style Guide

Please see the [style guide](./docs/style-guide.md) (with glossary) for documentation of the lexicographical conventions used in this database.

## The Database

The database is located in the private ALTLab repo at `crk/dicts/database-{hash}.ndjson`, where `{hash}` is an SHA1 hash of the database. This repo includes the following JavaScript utilities for working with the database, both located in `lib/utlities`.

* `loadEntries.js`: Reads all the entries from the database (or any NDJSON file) into memory and returns a Promise that resolves to an Array of the entries for further querying and manipulation.
* `saveDatabase.js`: Accepts an Array of database entries and saves it to the specified path as an NDJSON file with a trailing SHA1 hash. Note that by default the hash will be inserted into the provided filename: passing `database.ndjson` as the first argument to `saveDatabase.js` will save the file to `database-{hash}.ndjson`. You can disable this by passing `hash: false` as an option (in the options hash as the third argument to the function).

## Building & Updating the Database

To build and/or update the database, follow the steps below. Each of these steps can be performed independently of the others. You can also rebuild the entire database with a single command (see the end of this section).

1. Download the original data sources. These are stored in the private ALTLab repo in `crk/dicts`. **Do not commit these files to git.**

  * MD > CW mappings: `MD-CW-mappings.tsv`
  * _Cree: Words_: `Wolvengrey.toolbox`
  * Maskwacîs dictionary: `Maskwacis.tsv`

2. Install the dependencies for this repo: `npm install`. This will also add the conversion and import scripts to the PATH (see below).

3. Once installed, you can convert individual data sources by running `convert-* <inputPath> <outPath>` from the command line, where `*` stands for the abbreviation of the data source, ex. `convert-cw Wolvengrey.toolbox CW.ndjson`.

  You can also convert individual data sources by running the conversion scripts as modules. Each conversion script is located in `lib/convert/{ABBR}.js`, where `{ABBR}` is the abbreviation for the data source. Each module exports a function which takes two arguments: the path to the data source and optionally the path where you would like the converted data saved (this should have a `.ndjson` extension). Each module returns an array of the converted entries as well.

4. Once the individual data sources are converted to JSON, you can import them into the dictionary database by running their individual import scripts on the command line with `import-* <sourcePath> <databasePath>`, where `*` stands for the abbreviation of the data source, `<sourcePath>` is the path to the individual source database, and `<databasePath>` is the path to the combined ALTLab database. For example, you can import the CW database with `import-cw data/Wolvengrey.ndjson database.ndjson`. Some individual import scripts may require additional arguments—use `import-* --help` for more information.

  You can also import individual data sources by running the import scripts as modules. Each import script is located in `/lib/import/{ABBR}.js`, where `{ABBR}` is the abbreviation for the data source.

  Entries from individual sources are **not** imported as main entries in the ALTLab database. Instead they are stored as subentries (using the `dataSources` field). The import script merely matches entries from individual sources to a main entry, or creates a main entry if none exists. An aggregation script then does the work of combining information from each of the subentries into a main entry (see the next step).

5. (_Forthcoming_) [How to run the aggregation script that combines subentries into a single main entry.]

For convenience, you can perform all the above steps with a single command in the terminal: `npm run build <dataDir>` | `yarn build <dataDir>`, where `<dataDir>` is the directory where the data sources and ALTLab database are stored. In order for this command to work, you will need each of the following files to be present in the `<dataDir>` directory, with these exact filenames:

* `MD-CW-mappings.tsv`
* `Maskwacis.tsv`
* `Wolvengrey.toolbox`

## Tests

Test for this repository are written using Mocha + Chai. The tests check that the conversion scripts are working properly, and test for known edge cases. There is one test suite for each conversion script, located alongside that script in `lib` with the extension `.test.js`. You can run the entire test suite with `npm test`.

<!-- Links -->
[ALTLab]:     https://github.com/UAlbertaALTLab
[Arok]:       https://www.fnuniv.ca/academic/faculty/dr-arok-wolvengrey/
[Cree]:       https://en.wikipedia.org/wiki/Plains_Cree
[CW]:         https://uofrpress.ca/Books/C/Cree-Words
[DaFoDiL]:    https://format.digitallinguistics.io/
[itwewina]:   https://sapir.artsrn.ualberta.ca/cree-dictionary/
[Lacombe]:    https://en.wikipedia.org/wiki/Albert_Lacombe
[Maskwacis]:  https://en.wikipedia.org/wiki/Maskwacis
[MD]:         https://www.altlab.dev/maskwacis/dictionary.html
