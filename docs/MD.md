# Maskwacîs Dictionary

Notes on the Maskwacîs dictionary database.

## SRO

A transcription of the headword in Standard Roman Orthography (SRO).

* Occasionally includes punctuation, **ex:** _ah?_ 'What? What did you say?'.
* Vowel length is indicated with double vowels rather than macrons or circumflexes, **ex:** `aa`.
* Vowel length is not consistently indicated. Many long vowels are written as short vowels.
* `<i>` is (sometimes?/always?) used for unstressed short vowels (or maybe just unstressed short /a/?).
  - **ex:** MD _wapimew_ = SRO _wâpamêw_
* /h/ is sometimes omitted before stops (/c, p, t, k/).
* /ou/ is written `<iw>` or `<ow>`.
* SRO `<c>` is sometimes written as `<ch>` or `<ts>`.
* SRO `<c>` and `<ci>` can both be written as `<ts>`.
  - **ex:** MD _mitsow_ = SRO _mîcisow_
* Very occasionally includes a hyphen.
* Some entries are multiword headwords, **ex:** _ayamihew masinahikan_.
* Imperatives are not always given in their lemma form. This might need to be reconstructed using the FST.

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
