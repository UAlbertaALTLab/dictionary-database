# Notes on _Cree: Words_ (CW)

Documentation of the structure of the _Cree: Words_ (CW) Toolbox database.

This database lives in the ALTLab repo at `crk/dicts/Wolvengrey.toolbox`. Do **not** commit this data to git in any of our public repositories.

There is also an older, plain text version of this database available in `crk/dicts/Wolvengrey_original.txt`. This database was originally produced using Word Perfect, before Arok imported the database into Toolbox.

## Contents
<!-- TOC -->

- [General Notes](#general-notes)
- [`\??` **question**](#\-question)
- [`\alt` **alternative form** [multiple]](#\alt-alternative-form-multiple)
- [`\altsp` **spelling alternants**](#\altsp-spelling-alternants)
- [`\cat` **usage categories**](#\cat-usage-categories)
- [`\def` **definition** [multiple]](#\def-definition-multiple)
- [`\dl` **dialect** [multiple]](#\dl-dialect-multiple)
- [`\drv` **derivation** [multiple]](#\drv-derivation-multiple)
- [`\dt` **date**](#\dt-date)
- [`\fststem` **FST stem**](#\fststem-fst-stem)
- [`\gl` **gloss** [multiple]](#\gl-gloss-multiple)
- [`\gr1` **grammatical information** [multiple]](#\gr1-grammatical-information-multiple)
- [`\gr2` **grammatical information (freeform)**](#\gr2-grammatical-information-freeform)
- [`\his` **historical note**](#\his-historical-note)
- [`\mrp` **morphemes** [multiple]](#\mrp-morphemes-multiple)
- [`\mrp2` **morphemes** [multiple]](#\mrp2-morphemes-multiple)
- [`\new` **neologism** [multiple]](#\new-neologism-multiple)
- [`\ps` **part of speech** [multiple]](#\ps-part-of-speech-multiple)
  - [Notes on specific parts of speech](#notes-on-specific-parts-of-speech)
- [`\rel` **relation / related to** [multiple]](#\rel-relation--related-to-multiple)
- [`\rw` **rapid words**](#\rw-rapid-words)
- [`\sem` **semantic category** [multiple]](#\sem-semantic-category-multiple)
- [`\src` **data source**](#\src-data-source)
- [`\sro` **Standard Roman Orthography (SRO)**](#\sro-standard-roman-orthography-sro)
- [`\stm` **stem** [multiple]](#\stm-stem-multiple)
- [`\syl` **syllabics**](#\syl-syllabics)

<!-- /TOC -->

## General Notes

* The data is an export from software called [Toolbox][Toolbox], used by linguists to create lexical databases. Toolbox databases have a flat structure (they are not relational or document databases), and users can specify the fields in an open-ended fashion using line markers (codes with initial backslashes, **ex:** `\def` for 'definition'). Toolbox does not support hierarchy or nesting, so users will frequently create non-unique fields, or assume relationships between fields which are not otherwise linked.
* There are no unique identifiers for records in the database. For our purposes, the headword + part of speech fields can function as a multi-key ID.
* Fields marked `[multiple]` may appear multiple times within the same entry.
* `{curly brackets}`: inflectional morphemes
* `/slashes/`: derivational morphemes
* Some morphemes may be either inflectional or derivational.

## `\??` **question**

A field for outstanding questions and uncertainties, used by Arok to make notes to himself.

## `\alt` **alternative form** [multiple]

Alternative forms of the word, such as reduced forms or spelling variants.

Arok is considering dividing this into `\alt` and `\alt-sp` (spelling variants). [2021/03/16]

Arok has in fact occasionally used `\altsp` (10 times). See below.

## `\altsp` **spelling alternants**

Alternative spellings of the word.

## `\cat` **usage categories**

Categories of usage, **ex:** `baby talk`, `traditional`, `borrowing`, `Christian term`. Currently this field may appear multiple times, but Arok is fine with them being combined. [3/30/21]

## `\def` **definition** [multiple]

A definition for the entry.

* Some objects are given in parentheses, **ex:** `(s.t.)`
* multiple definition fields: should be considered two separate entries
* definitions divided by semicolons: should be considered two separate senses
* definitions divided by commas: should be considered two separate subsenses (probably don't need a distinct object for these)
* The definition field includes cross-references, which should be extracted into their own field.
  - **ex:** `[see XXX]` (only use first word following `see` as the entry)
  - **ex:** `[see XXX …]`: general note
  - **ex:** `…; see {also} XXX\n` [there are only 6 instances of these, and they either can't be done programmatically, or we wouldn't want to]
  - **ex:** `[cf. XXX]` [this only occurs 1x]
  - **ex:** `[cf. XXX "definition"]` [this only occurs in the grammar fields, not definitions]
* The definition field includes encyclopedic / usage notes `[in brackets]` as well. These should also be parsed into separate fields, when possible.
  - There can be multiple notes, each contained within the same set of brackets, and separated by semicolons.
  - Each note has a leader:
    - `e.g. XXX "definition"`: example
    - `i.e.`: general note
    - `lit.`: literal definition
    - `lit:`: literal definition
    - `lit.:`: literal definition
    - `literally`: literal definition
    - `literally:` literal definition
  - Items with no leader are general notes.
  - Sometimes literal definitions are not placed in brackets, and simply given with `…; literally: XXX`
  - Literal definitions may or may not be wrapped in quotes (usually double quotes).
  - Latin terms for items apply to just the current semicolon-delineated definition:
    - `[Lt. XXX]`
    - `[Lt: XXX]`
    - `[Latin: XXX]`
  - Other items which end with a colon (`[description:]`) apply to just the current semicolon-delimited definition. These can be extracted into a `usages` field. Some examples:
    - `archaic:` archaic sense
    - `Christian:` Christian sense
    - `in jest:` humorous sense
    - `in numeral phrases:` sense in numeral phrases
    - `emphatic:` emphatic sense
    - `fig:` figurative sense
    - `figurative:` figurative sense
    - `figuratively:` figurative sense
    - `historically:` historic sense
    - `pl:` sense in the plural
    - `plural:` sense in the plural
    - `predicative:` predicative sense
    - `sg:` sense in the singular
    - `singular:` sense in the singular
    - `slang:` sense when used as slang
  - Other notes containing a semicolon are a usage + definition, but can be stored as general notes, **ex:** `typically in negative: "s/he has a not good disease, s/he has a bad disease"`.

## `\dl` **dialect** [multiple]

Lists the dialects that the entry belongs to. Each dialect should get its own `\dl` field; they should not be combined into a single field.

Abbreviation | Dialect              | Glottocode | ISO 639-3
-------------|----------------------|------------|----------
`npC`        | Northern Plains Cree | `nort2960` | `crk`
`pC`         | Plains Cree          | `plai1258` | `crk`
`sC`         | Swampy Cree          | `swam1239` | `csw`
`wC`         | Woods Cree           | `wood1236` | `cwd`

## `\drv` **derivation** [multiple]

A list of forms showing the derivational breakdown of the word, each separated by ` + `.

* Unclear why there can sometimes be multiple derivation fields.
* Only shows the topmost layer of derivational structure.
* Almost always contains a reference to another entry, except for TI-2 stems (see [part of speech](#\ps-part-of-speech) below).
* `/word-/` indicates a stem (primary or secondary), to which inflection is added.
* `/-affix/` indicates a derivational suffix (primary or secondary).
* If the entry is a primary derivation, this field contains the components.
* If the entry is a secondary derivation, it shows the topmost stem + the secondary derivational affix.

## `\dt` **date**

The date that the entry was last updated.

## `\gl` **gloss** [multiple]

The gloss fields are really just used for English reversal entries. The FST relies on this field for diminutives. This information should be extracted into its own field.

## `\gr1` **grammatical information**

A structured field containing information about the grammatical categories of the entry, **ex:** `singular`, `diminutive`. Entries with different sets of grammatical information should be separated into distinct entries (i.e. this field should never appear twice in an entry).

* The information in this field is used to garner inflectional information, specifically whether the word can take _‑im_ POSS or _‑is_ DIM.
* `N`: `singular` | `plural` (occasionally other values)
* secondary derivation: `reciprocal` | `diminutive` | etc.
* Almost all verbs will have `independent, {person}` in this field.
* A following semicolon indicates other information.

## `\gr2` **grammatical information (freeform)**

A freeform field for any other grammatical notes about the entry.

## `\his` **historical note**

Historical notes about the entry. Currently this field can occur multiple times, but Arok agrees that this can be combined into a single field. [3/30/21]

## `\mrp` **morphemes** [multiple]

Each `\mrp` field shows one of the morphemes contained in the stem (`\stm`), regardless of whether that morpheme is part of the primary or secondary stem, or derivational or inflectional.

This field allows for nesting, where an `\mrp` field can be followed immediately by an `\mrp2` field, so that the `\mrp2` field indicates the morphemes contained within the `\mrp` field

* `stem-`: "free" stems (like bound nouns)
* `/initial-/` (also `/stem-/`?)
* `/-medial-/`
* `/-final/`

The following idiosyncrasies will need to be handled when parsing this field, where `morpheme` stands for the form of the morpheme.

* `morpheme**`
* `""morpheme""`
* `"morpheme`
* `morpheme OR morpheme`
* `morph(eme)`
* `<T>` (historical T)
* `morpheme [note]`

## `\mrp2` **morphemes** [multiple]

This field shows a morpheme breakdown for each of the morphemes in `\mrp`. Each `\mrp2` field corresponds to the `\mrp` field preceding it. Occasionally a morpheme is listed with two leading asterisks; this indicates a tentative form, or forms that are very restricted in their distribution.

## `\new` **new since 2001 publication** [multiple]

The value of this field is always `new` (with perhaps one exception; see below). This field indicates that the entry was added after the publication of the 2001 edition of the _Cree: Words_ dictionary was published.

Not all entries since 2001 are marked as new. These could potentially be determined based on information in the `\src` field. In at least one case, this field appears multiple times, with one of the fields blank, and the other containing `new`.

## `\ps` **part of speech** [multiple]

This field really combines information on part of speech, morpheme type, and inflectional class. If an entry has multiple `\ps` fields, those should each be given their own sense (with the same definition, if necessary).

1. general word class (`N` | `V` | etc.)
2. specific word class (`VTA` | `VTI` | `VAI` | `VII` | etc.)
   - Only tells you the inflectional class in the abstract. The surface form cannot be determined with this information alone.
3. inflectional class
   - Tells you the specific morphological exponents.

Code | Description
---- | -----------
INM  | indeclinable nominal  

### Notes on specific parts of speech

* `INM`
  - Things that are not morphological nouns, but are used nominally.
  - Shows breakdowns for complex forms.
  - **Example:** `INM < NA-1 + NEG + VAI-1`
  - Note that in the above example, `NEG` is used, even though this part of speech isn't used in entries. Arok is being more specific here than his usual part-of-speech classification.

## `\rel` **relation / related to** [multiple]

Used for items that are either more obscurely derivationally-related, OR closely-related synonyms.

For now this field is functioning as a general cross-reference field.

## `\rw` **rapid words**

Semantic classification of the entry according to the [Rapid Words][RapidWords] semantic hierarchy.

* This may not actually be present in certain versions of this database.
* The data in this field comes from Daniel Dacanay's semantic classification.

## `\sem` **semantic category** [multiple]

Each `\sem` field lists one semantic category that applies to the entry. The values in this field appear to be freeform, rather than being chosen from a prespecified set of semantic tags.

Arok thinks most of the data in this field is obsolete and can be replaced with Daniel Dacanay's semantic classifications.

## `\src` **data source**

Where the information in the entry comes from. May contain multiple sources. Usually publications, sometimes speaker codes (less common).

## `\sro` **Standard Roman Orthography (SRO)**

The transcription of the lemma in Standard Roman Orthography (SRO).

## `\stm` **stem** [multiple]

Lists the outermost stem of the word. This is a bare stem, not necessarily a minimal wordform.

* The Plains Cree FST typically uses this field to determine the stem used by the FST. However, there are ~1,000 entries for which the FST stem has to be specified manually. It's important to retain this data, and use it instead of the data in the `\stm` field in these cases.
* This field is occasionally duplicated (in 22 entries) when the headword is a multi-word phrase (`INM`).
* Some entries do not have a final hyphen, even when it seems like they should. It's not clear whether this difference is meaningful or accidental.

## `\syl` **syllabics**

A transcription of the headword in Syllabics.

* Retain this data of course, but don't use it for the main entry or transliterate it. Transliteration from SRO > Syllabics will be automated by itwêwina.

<!-- LINKS -->
[RapidWords]: http://www.rapidwords.net/
[Toolbox]:    https://software.sil.org/toolbox/
