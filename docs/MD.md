# Maskwacîs Dictionary

Notes on the Maskwacîs dictionary database.

## SRO

A transcription of the headword in Standard Roman Orthography (SRO).

* Occasionally includes punctuation, **ex:** _ah?_ 'What? What did you say?'.
* Vowel length is indicated with double vowels rather than macrons or circumflexes, **ex:** `aa`.
* Vowel length is not consistently indicated. Many long vowels are written as short vowels.
* `<i>` is sometimes used for unstressed short vowels (or maybe just unstressed short /a/?).
  - **ex:** MD _wapimew_ = SRO _wâpamêw_
* /h/ is sometimes omitted before stops (/c, p, t, k/).
* /ou/ is written `<iw>` or `<ow>`.
* SRO `<c>` is sometimes written as `<ch>` or `<ts>`.
* SRO `<c>` and `<ci>` can both be written as `<ts>`.
  - **ex:** MD _mitsow_ = SRO _mîcisow_
* Very occasionally includes a hyphen.
* Some entries are multiword headwords, **ex:** _ayamihew masinahikan_.
* There isn't always a lemma entry for imperative verb entries. In some cases we may need to reconstruct the lemma ourselves.

## Syllabics

The transcription of the headword in Cree Syllabics. This field was programmatically generated from the SRO field, meaning that it follows the same conventions as the SRO field. For example, vowel length is not indicated, and unstressed short vowels are represented as /i/, **ex:** _wâpamêw_ is written as `ᐊᐧᐱᒣᐤ` instead of `ᐚᐸᒣᐤ`.

## POS

The part of speech for the entry. Many abbreviations are obvious, but others are opaque and need investigating.

* Some entries do not have a part of speech indicated.
* There are 47 unique parts of speech in the database. This list will need to be reduced and standardized.

Abbreviation                     | Part of Speech
---------------------------------|---------------
anim pl pron                     | animate plural pronoun
anim/prefix                      |
bp                               |
excl                             | exclamation
exclamation                      | exclamation
expr                             |
fv                               |
fvp                              |
gvp                              |
inan pl pron                     | inanimate plural pronoun
interj                           | interjection
interjection                     | interjection
IPC                              | indeclinable particle
loc                              |
n                                | noun
n pl                             | plural-only noun
n sg                             | singular-only noun
particle denoting the past tense | particle denoting past tense
phrase                           | phrase
prefix                           | prefix
prefix denoting something happen | prefix denoting something happened
preverb                          | preverb
pron                             | pronoun
pron pl                          | plural pronoun
pron plural                      | plural pronoun
pron sing                        | singular pronoun
ques                             | question
question                         | question
reduplicative prefix             | reduplicative prefix
reply                            | reply
suffix                           | suffix
v                                | verb
v comb                           |
v command                        | imperative verb
v phrase                         |
v phrase pl                      |
v pl                             | plural-only verb
v sg                             | singular-only verb
vc                               | imperative verb
vc pl                            | plural imperative verb
vcp                              |
vfp                              |
vgp                              |
vp                               |
vp pl.                           |
vpq                              |

## MeaningInEnglish

The English definition of the term.

* Occasionally includes example phrases or sentences, usually preceded by `e.g.` / `E.g.`.
  - Other types of notes are also preceded by `e.g.` / `E.g.`, making it difficult to rely on this for programmatic processing.
  - Example phrases are followed by their translations. If the example ends in punctuation, the translation simply follows the example, after a space. If the example does not end in punctuation, the example and its translation are separated by a hyphen surrounded by spaces.
  - **ex:** "You are cold. Usually used in a question. E.g. kikawacin ci? Are you cold?"
  - **ex:** "Ahead of time. Now, instead of later. E.g. kisac tota - Do it now, instead of later. Also, at once."
* Some of the definitions have Cree words in them, and we'd like these converted to cross-references, and their spellings standardized to SRO. This will probably require manual editing.
  - **ex:** https://itwewina.altlab.app/search?q=ahci: supposed to be _âhc âna_ (from _âhci ana_)
* The definitions sometimes contain encyclopedic / usage notes. These are not demarcated in any special way, except perhaps as distinct sentences.
* The definitions include sentence punctuation, which should not be sent to the FST. The definitions do not include abbreviations such as `s.o.`.
* Parentheticals = sentences that start with:
  - Also
  - And
  - Or
* Senses / definitions are occasionally separated by sense numbers.
* Grammatical information: `Animate.` | `Inanimate.` (sometimes lowercase)
* Part of speech: `noun.` | `verb.` (sometimes with initial capital letter)
* We need to store 3 versions of the definition:
  - _original_: the original MD definition, verbatim
    - Store this in the alternative analysis entry.
  - _FST_: the cleaned and edited version sent to the FST
    - Store this in the main entry, on the sense from MD.
  - _user_: original, except with Cree words corrected
    - Store this in the main entry.

## RapidWordsClasses

A semicolon-delimited list of rapid word classes that apply to this entry. Each class corresponds to a index in the [RapidWordsIndices](#RapidWordsIndices) field. The Rapid Words classes are given at the second-highest and deepest possible level of the Rapid Words hierarchy (to the extent possible). Entries may have been judged to fall under more than one Rapid Words class (at the second-highest and deepest level in the Rapid Words hierarchy).

## RapidWordsIndices

A semicolon-delimited list of indices for the rapid word classes that apply to this entry. Each index corresponds to a rapid words class in the [RapidWordsClasses](#RapidWordsClasses) field. The indices are given at the second highest and deepest possible levels in the Rapid Words hierarchy, and an entry can belong under multiple distinct classes.

## English_POS

The English definition, with each word tagged for part of speech. The parsing was undertaken with the publicly available Stanford parser. That provides a lemma for word-forms, which is provided for verbs (and nouns, I think [AA]).

* The tag is appended to the end of each word in the format `_{TAG}`, **ex:** `The_DET`, indicating that the word _The_ is a determiner.
* Items with no tag have the appended underscore but no tag.
* Punctuation is also tagged with just the underscore, and no tag.

## English_Search

Contains a simplified version of the definition. For verbs, this means providing an English-like entry starting with the infinitive form of the verb (using the lemma, and excluding the initial subject pronoun). The use of this field and how it was generated is currently unclear.
