# Notes on _Cree: Words_ (CW)

Documentation of the structure of the _Cree: Words_ (CW) Toolbox database.

This database lives in the ALTLab repo at `/crk/dicts/Wolvengrey.toolbox`. Do **not** commit this data to git in any of our public repositories.

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
* There are no unique identifiers in the database. For our purposes, the headword + part of speech fields can function as a multi-key ID.
* Fields marked `[multiple]` may appear multiple times within the same entry.
* `{curly brackets}`: inflectional morphemes
* `/slashes/`: derivational morphemes
* Some morphemes may be either inflectional or derivational.
* Some fields in the database wrap onto the next line. This _seems_ to happen only with the `\gl` field.
  - `\gl Cree\nNation`
  - `\gl icebox\nrefrigerator`
  - `\gl oh\ngl\hah` (no backslash on second `gl`)
  - entry for 'broth'

## `\??` **question**

A field for outstanding questions and uncertainties, used by Arok to make notes to himself.

## `\alt` **alternative form** [multiple]

Alternative forms of the word, such as reduced forms or spelling variants.

Arok is considering dividing this into `\alt` and `\alt-sp` (spelling variants). [2021/03/16]

Arok has in fact occasionally used `\altsp` (10 times). See below.

## `\altsp` **spelling alternants**

Alternative spellings of the word.

## `\cat` **usage categories**

Categories of usage, **ex:** `baby talk`, `traditional`, `borrowing`, `Christian term`.

[Currently this is a multiple field, but I'm asking Arok to combine the one case this happens.]

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

Lists the dialects that the entry belongs to.

Abbreviation | Dialect              | Glottocode | ISO 639-3
-------------|----------------------|------------|----------
`npC`        | Northern Plains Cree | `nort2960` | `crk`
`pC`         | Plains Cree          | `plai1258` | `crk`
`sC`         | Swampy Cree          | `swam1239` | `csw`
`wC`         | Woods Cree           | `wood1236` | `cwd`

## `\drv` **derivation** [multiple]

A list of forms showing the derivational breakdown of the word, each separated by ` + `.

* Unclear why there can sometimes be multiple derivation fields.
* Only shows the topmost layer of derivational structure (**ex:** primary stem + secondary derivation).
* Almost always contains a reference to another entry, except for TI-2 stems (see [part of speech](#\ps-part-of-speech) below).
* `/word-/` indicates a stem (primary or secondary), to which inflection is added.
* `/-affix/` indicates a derivational suffix (primary or secondary).

## `\dt` **date**

The date that the entry was last updated.

## `\fststem` **FST stem**

This field is _not_ in the Toolbox database. This data only lives in the TSV version of this file. There are somewhere in the range of ~1,500 entries total where this information has been added. This data should be retrieved and added to the main entry in the dictionary database. Forms marked as "CHECK" are ones that need FST stems.

## `\gl` **gloss** [multiple]

The gloss fields are really just used for English reversal entries. The FST relies on this field for diminutives. This information should be extracted into its own field.

## `\gr1` **grammatical information** [multiple]

A structured field containing information about the grammatical categories of the entry, **ex:** `singular`, `diminutive`.

* `N`: `singular` | `plural` (occasionally other values)
* secondary derivation: `reciprocal` | `diminutive` | etc.
* The information in this field is used to garner inflectional information, specifically whether the word can take _‑im_ POSS or _‑is_ DIM.

## `\gr2` **grammatical information (freeform)**

A freeform field for any other grammatical notes about the entry.

## `\his` **historical note**

Historical notes about the entry.

[Currently this is a multiple field, but I'm asking Arok to combine the 2 cases this happens.]

## `\mrp` **morphemes** [multiple]

Each `\mrp` field shows one of the morphemes contained in the entry, regardless of whether that morpheme is part of the primary or secondary stem, or derivational or inflectional.

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

Arok is in the process of adding this field to the database. [2021/03/16] This field will show a morpheme breakdown for the morphemes in `\mrp`.

It's unclear how this field is to be interpreted when there are multiple morphemes in `\mrp`. A good default assumption is that `\mrp2` only shows the morpheme breakdown for the stem in `\mrp` (so `\mrp2` is essentially the stem components—initial, medial, and final).

## `\new` **neologism** [multiple]

The value of this field is always `new` (with perhaps one exception; see below). This field seems to function as a Boolean, indicating (presumably) that the entry is a neologism. It might also be a field Arok uses for himself, to keep track of which entries are new.

In at least one case, this field appears multiple times, with one of the fields blank, and the other containing `new`.

## `\ps` **part of speech** [multiple]

This field really combines information on part of speech, morpheme type, and inflectional class.

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

Lists the outermost stem of the word.

* The Plains Cree FST typically uses this field to determine the stem used by the FST. However, there are ~1,000 entries for which the FST stem has to be specified manually. It's important to retain this data, and use it instead of the data in the `\stm` field in these cases.
* This field is occasionally duplicated (in 22 entries) when the headword is a multi-word phrase (`INM`).
* Some entries do not have a final hyphen, even when it seems like they should. It's not clear whether this difference is meaningful or accidental.

## `\syl` **syllabics**

A transcription of the headword in Syllabics.

* Retain this data of course, but don't use it for the main entry or transliterate it. Transliteration from SRO > Syllabics will be automated by itwêwina.

<!-- LINKS -->
[RapidWords]: http://www.rapidwords.net/
[Toolbox]:    https://software.sil.org/toolbox/
