# Plains Cree Dictionary Database Management

The repository contains scripts and documentation for managing the multiple data sources for [ALTLab's][ALTLab] [Plains Cree][Cree] dictionary, which can be viewed online [here][itwewina]. This repository does _not_ (and should not) contain the actual data.

The database uses the [Data Format for Digital Linguistics][DaFoDiL] (DaFoDiL) as its underlying data format, a set of recommendations for storing linguistic data in JSON.

## Contents
<!-- TOC -->

- [Sources](#sources)
- [Project Requirements](#project-requirements)
- [Process](#process)
- [Style Guide](#style-guide)
- [Building the Database](#building-the-database)

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

## Building the Database

1. Download the original data sources. These are stored in the private ALTLab repo in `crk/dicts`.

   Currently the only data source that this repo parses is the _Cree: Words_ (CW) database, stored in `crk/dicts/Wolvengrey.toolbox` in the ALTLab repo. **Do not commit these files to git.**

2. Install the dependencies for this repo: `npm install`. This will also add the conversion scripts to the PATH (see next step).

3. Once installed, you can convert individual data sources by running `convert-* <inputPath> <outPath>` from the command line, where `*` stands for the abbreviation of the data source, ex. `convert-cw Wolvengrey.toolbox CW.json`.

4. You can also convert individual data sources by running the conversion scripts as modules. Each conversion script is located in `lib/convert.{ABBR}.js`, where `{ABBR}` stands for the abbreviation of the data source. Each module exports a function which takes two arguments: the path to the data source and the path where you would like the converted data saved (this should have a `.json` extension).

## Tests

Test for this repository are written using Mocha + Chai. The tests check that the conversion scripts are working properly, and test for known edge cases. There is one test suite for each conversion script, located alongside that conversion script in `lib`, with the extension `.test.js`. You can run the entire test suite with `npm test`.

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
