# Maskwacîs Dictionary

## General Notes

The TSV version of the Maskwacîs dictionary in the ALTLab repo also has semantic classifications, using the Rapid Words ontology.

## SRO

* Inconsistent marking of vowel length.

## Definition

* The definitions sometimes contain encyclopedic / usage notes. These are not demarcated in any special way, except perhaps as distinct sentences.
* The definitions include sentence punctuation, which should not be sent to the FST. They do not include abbreviations such as `s.o.`.
* Parentheticals = sentences that start with:
  - Also
  - And
  - Or
* Grammatical information: `Animate.` | `Inanimate.`
* Senses / definitions are occasionally separated by sense numbers.
* Part of speech: `Noun.` | `noun.` | `verb.`
* Cross-references: Any Cree words in the definition need to be flagged as cross-references.
* We need to store 3 versions of the definition:
  - _original_: the original MD definition, verbatim
    - Store this in the alternative analysis entry.
  - _FST_: the cleaned and edited version sent to the FST
    - Store this in the main entry, on the sense from MD.
  - _user_: original, except with Cree words corrected
    - Store this in the main entry.
