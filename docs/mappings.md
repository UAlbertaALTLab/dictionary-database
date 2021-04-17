# MD > CW Mappings

@katieschmirler created a TSV file mapping entries in the MD database to their equivalent entry in the CW database. There are 5,153 mappings in total, 51 of which have duplicate MD headwords. It consists of the following columns:

* lemma_MD: The headword in the MD database.
* lemma_CW: The headword of the match in the CW database.
* definition_MD: The definition from the MD database.
* definition_CW: The definition from the CW database.
* matchType: The type of match (see [Match Types](#match-types) below)
* FST: The FST stem for the corresponding CW entry.

## Match Types

There are several types of matches:

* broad
* conjugation
* dialect
* different
* equivalent
* Err/Orth
* narrow
* same
* similar

## Using the Mappings

The utility script `lib/utilities/getMappings.js` reads the MD > CW mappings file and returns a JavaScript Map of the records in the mappings TSV. The keys for the map are the MD headwords.
