# Database Overview

## Converting _Cree: Words_ Toolbox Entries > DLx JSON

* Simple conversion - no matching/aggregating yet.
* Stored as NDJSON files.

### _acâhkos_

Typical entry.

```txt
\sro acâhkos
\syl ᐊᒑᐦᑯᐢ
\ps NA-1
\def star, little star
\dl Cree: pC
\dl Cree: wC
\gr1 singular, diminutive
\stm acâhkos-
\drv atâhkw- + /-is/
\mrp atâhkw-
\mrp /-is/
\alt
\rel atâhk
\sem Sky
\gl star
\gl little
\cat
\his *aθa:nkwa
\his *aθankwa
\his Saulteaux: anank
\gr2
\src AE, W&A
\dt 04/Jun/2016
```

```json
{
  "definition": "star, little star",
  "dialects":   ["plai1258", "wood1236"],
  "glosses":    ["star", "little"],
  "pos":        "NA-1",
  "lemma":      {
    "plains": "acâhkos",
    "sro":    "acâhkos",
    "syll":   "ᐊᒑᐦᑯᐢ"
  },
  "senses": [{
    "definition": "star, little star"
  }],
  "key": "acahkos"
}
```

### _ýôtinipêstâw_ 'it rains with wind'

SRO + Plains

```txt
\sro ýôtinipêstâw
\syl ᔫᑎᓂᐯᐢᑖᐤ
\ps VII-2v
\def it rains with wind
\dl Cree: pC
\gr1 Independent, 0s
\stm ýôtinipêstâ-
\drv ýôtin- + /-pêstâ/
\mrp /ýow-/
\mrp /-tin/
\mrp /-pêst-/
\mrp /-â/-1
\alt
\rel
\sem Weather
\gl rain
\gl wind
\cat
\his
\gr2
\dt 28/Jul/2018
```

```json
{
  "definition": "it rains with wind",
  "dialects":   ["plai1258"],
  "glosses":    ["rain", "wind"],
  "pos":        "VII-2v",
  "lemma":      {
    "plains": "yôtinipêstâw",
    "sro":    "ýôtinipêstâw",
    "syll":   "ᔫᑎᓂᐯᐢᑖᐤ"
  },
  "senses": [{
    "definition": "it rains with wind"
  }],
  "key": "yotinipestaw"
}
```

### _acâhkosa kâ-otakohpit_ 'Starblanket'

Multiple definitions.

```txt
\sro acâhkosa kâ-otakohpit
\syl ᐊᒑᐦᑯᓴ  ᑳ ᐅᑕᑯᐦᐱᐟ
\ps INM
\def Starblanket; literally: "One who has Stars as a Blanket"; name of Cree chief, signatory to Treaty 4
\dl Cree: pC
\gr1 obviative (3'); Conjunct, 3s(-3')
\stm acâhkos- NA-1
\drv atâhkw- + /-is/
\mrp atâhkw-
\mrp /-is/
\stm otakohpi- VAI-v
\drv /ot-/ + akohp- + /-i/
\mrp /ot-/
\mrp akohp-
\mrp /-i/
\alt acâhkosa k-ôtakohpit
\rel
\sem Personal Names
\sem People
\gl star
\gl blanket
\gl starblanket
\gl chief
\gl Cree
\cat
\his
\gr2
\dt 13/May/2008
```

```json
{
  "definition": "Starblanket; literally: \"One who has Stars as a Blanket\"; name of Cree chief, signatory to Treaty 4",
  "dialects":   ["plai1258"],
  "glosses":    ["star", "blanket", "starblanket", "chief", "Cree"],
  "pos":        "INM",
  "lemma":      {
    "plains": "acâhkosa kâ-otakohpit",
    "sro":    "acâhkosa kâ-otakohpit",
    "syll":   "ᐊᒑᐦᑯᓴ  ᑳ ᐅᑕᑯᐦᐱᐟ"
  },
  "senses": [
    {
      "definition": "Starblanket"
    }, {
      "definition": "name of Cree chief, signatory to Treaty 4"
    }
  ],
  "literalMeaning": "One who has Stars as a Blanket",
  "notes": [{
    "noteType": "general",
    "text":     "literally: \"One who has Stars as a Blanket\""
  }],
  "key": "acahkosa_kaotakohpit"
}
```

### _ahcâpâsk_ 'mountain ash'

Parenthetical.

```txt
\sro ahcâpâsk
\syl ᐊᐦᒑᐹᐢᐠ
\ps NI-3
\def mountain ash; [literally: "bow-wood"]
\dl Cree: pC
\gr1 singular
\stm ahcâpâskw-
\drv /ahcâp(y)-/ + /-âskw/
\mrp /ahcâp(y)-/
\mrp /-âskw/
\alt
\rel ahcâpiy
\sem Plants
\sem Trees
\gl mountain
\gl ash
\cat
\his
\gr2
\src BA
\new new
\dt 26/Mar/2018
```

```json
{
  "definition": "mountain ash; [literally: \"bow-wood\"]",
  "dialects":   ["plai1258"],
  "glosses":    ["mountain", "ash"],
  "pos":        "NI-3",
  "lemma":      {
    "plains": "ahcâpâsk",
    "sro":    "ahcâpâsk",
    "syll":   "ᐊᐦᒑᐹᐢᐠ"
  },
  "senses": [{
    "definition": "mountain ash"
  }],
  "literalMeaning": "bow-wood",
  "notes": [{
    "noteType": "general",
    "text":     "literally: \"bow-wood\""
  }],
  "key": "ahcapask"
}
```

## Converting Maskwacîs Dictionary to DLx JSON

* Simple conversion to JSON.
* Add MD > CW mappings.

### Maskwacîs TSV Entries

SRO | Syllabics | POS | MeaningInEnglish | RapidWordsClasses | RapidWordIndices | English_POS | English_Search
-- | -- | -- | -- | -- | -- | -- | --
achihtin | ᐊᒋᐦᑎᐣ | v phrase | It does not fit through. | arrange; big; fit_size; move_something; move_something_in_a_direction; push | 7.5; 8.2; 8.2.7; 7.3; 7.3.2; 7.3.2.9 | it_PRON_SUBJ does#do_V not#not_ADV fit#fit_V through_PREP ._ | not fit through.
ahtastaw | ᐊᐦᑕᐢᑕᐤ | v phrase | 1. He places it at a different place. 2. He changes the dates or events to a different time and place. | move; move_something; take_somewhere | 7.2; 7.3; 7.3.3 | 1_NUM ._ he_PRON_SUBJ places#place_V it#it_PRON at_PREP a_DET different#different_ADJ place#place_N ._ 2_NUM ._ he_PRON_SUBJ changes#change_V the_DET dates#date_N or_CC events#event_N to_PREP a_DET different#different_ADJ time#time_N and_CC place#place_N ._ | 1. place it at a different place. 2. change the dates or events to a different time and place.

### MD > CW Mappings

* Some CW entries have been updated, and can no longer be matched.
* Mappings file doesn't include POS, but this is a necessary disambiguator.
* Multiple mappings can point to the same CW entry. These MD entries get merged.
* I'd really like to move mappings directly into the MD database. Would make it much easier to a) compile the database, and b) update the MD data/mappings.

lemma_MD | lemma_CW | definition_MD | definition_CW | matchType | fstStem
-- | -- | -- | -- | -- | --
Akamihk | 1: akâmihk | Montana Reserve. | across, on the far side; across (water or land) | dialect | akâmihk+Ipc
Asokanihk | 1: âsokanihk | Ponoka | bridge; wharf, pier | dialect | âsokan+N+IN+Loc
Awasapisk | 1: awasâpisk | Beyond the Rocky Mountains, B.C. | beyond the rocks; beyond the Rocky Mountains ;; British Columbia | equivalent | awasâpisk+Ipc
Maskwachisihk | 1: maskwacîsihk | Hobbema. | Hobbema, AB; literally: "Little Bear Hills" | equivalent | maskwacîs+N+IN+Loc
Notinito sipiy | 1: nôtinito-sîpiy | Battle River. | Battle River, SK | same | nôtinito-sîpiy+N+IN+Sg
Wisahkechahk | 1: wîsahkêcâhk | 1. A legendary superhuman figure who pulled tricks on people and animals. 2. Another name for Santa Claus. | Wisahkecahk; Cree culture hero, legendary figure | similar | wîsahkêcâhk+N+AN+Sg
Witaskiwinihk | 1: wîtaskîwinihk | Wetaskiwin. | peace, truce, alliance ;; Wetaskiwin, AB | similar | wîtaskîwin+N+IN+Loc

### DLx JSON Entries

#### _achihtin_ 'it does not fit through'

```txt
achihtin | ᐊᒋᐦᑎᐣ  | v phrase | It does not fit through. | ...
```

```json
{
  "English_POS":       "it_PRON_SUBJ does#do_V not#not_ADV fit#fit_V through_PREP ._",
  "English_Search":    "not fit through.",
  "RapidWordIndices":  "7.5; 8.2; 8.2.7; 7.3; 7.3.2; 7.3.2.9",
  "RapidWordsClasses": "arrange; big; fit_size; move_something; move_something_in_a_direction; push",
  "definition":        "It does not fit through.",
  "lemma":             {
    "md":        "achihtin",
    "syllabics": "ᐊᒋᐦᑎᐣ"
  },
  "senses": [{
    "category":        "v phrase",
    "definition":      "It does not fit through.",
    "semanticDomains": ["arrange", "big", "fit_size", "move_something", "move_something_in_a_direction", "push"],
    "semanticIndices": ["7.5", "8.2", "8.2.7", "7.3", "7.3.2", "7.3.2.9"]
  }],
  "mapping": {
    "lemma_MD":      "achihtin",
    "lemma_CW":      "âcihtin",
    "definition_MD": "It does not fit through.",
    "definition_CW": "it catches in the corners so as to be blocked or stuck",
    "matchType":     "similar",
    "fstStem":       "âcihtin+V+II+Ind+Prs+3Sg"
  }
}
```

#### _ahtastaw_ 'he places it at a different place'

```txt
ahtastaw | ᐊᐦᑕᐢᑕᐤ | v phrase | 1. He places it at a different place. 2. He changes the dates or events to a different time and place. | ...
```

```json
{
  "English_POS":       "1_NUM ._ he_PRON_SUBJ places#place_V it#it_PRON at_PREP a_DET different#different_ADJ place#place_N ._ 2_NUM ._ he_PRON_SUBJ changes#change_V the_DET dates#date_N or_CC events#event_N to_PREP a_DET different#different_ADJ time#time_N and_CC place#place_N ._",
  "English_Search":    "1. place it at a different place. 2. change the dates or events to a different time and place.",
  "RapidWordIndices":  "7.2; 7.3; 7.3.3",
  "RapidWordsClasses": "move; move_something; take_somewhere",
  "definition":        "1. He places it at a different place. 2. He changes the dates or events to a different time and place.",
  "lemma":             {
    "md":        "ahtastaw",
    "syllabics": "ᐊᐦᑕᐢᑕᐤ"
  },
  "senses": [
    {
      "category":        "v phrase",
      "definition":      "He places it at a different place.",
      "semanticDomains": ["move", "move_something", "take_somewhere"],
      "semanticIndices": ["7.2", "7.3", "7.3.3"]
    }, {
      "category":        "v phrase",
      "definition":      "He changes the dates or events to a different time and place.",
      "semanticDomains": ["move", "move_something", "take_somewhere"],
      "semanticIndices": ["7.2", "7.3", "7.3.3"]
    }
  ],
  "mapping": {
    "lemma_MD":      "ahtastaw",
    "lemma_CW":      "âhtastâw",
    "definition_MD": "1. He places it at a different place. 2. He changes the dates or events to a different time and place.",
    "definition_CW": "s/he moves s.t.'s place; s/he puts s.t. elsewhere, s/he places s.t. elsewhere",
    "matchType":     "broad",
    "fstStem":       "âhtastâw+V+TI+Ind+Prs+3Sg"
  }
}
```

## Matching + Aggregating Individual Sources into the ALTLab Database

Caveat: This data structure can be adjusted if needed to accommodate our current data structure in itwêwina.

### _acâhkos_ 'star'

Note here that the definition in the mapping is different from the definition in the CW entry.

```json
{
  "dataSources": {
    "MD": {
      "English_POS": "A_DET star#star_N ._",
      "English_Search": "a star.",
      "RapidWordIndices": "1.1; 1.1.1.2; 1.1.1",
      "RapidWordsClasses": "sky; star; sun",
      "definition": "A star.",
      "lemma": {
        "md": "achahkos",
        "syllabics": "ᐊᒐᐦᑯᐢ"
      },
      "senses": [{
        "category": "n",
        "definition": "A star.",
        "semanticDomains": ["sky", "star", "sun"],
        "semanticIndices": ["1.1", "1.1.1.2", "1.1.1"]
      }],
      "mapping": {
        "lemma_MD": "achahkos",
        "lemma_CW": "acâhkos",
        "definition_MD": "A star.",
        "definition_CW": "star",
        "matchType": "same",
        "fstStem": "acâhkos+N+AN+Sg"
      }
    },
    "CW": {
      "definition": "star, little star",
      "dialects": ["plai1258", "wood1236"],
      "glosses": ["star", "little"],
      "pos": "NA-1",
      "lemma": {
        "plains": "acâhkos",
        "sro": "acâhkos",
        "syll": "ᐊᒑᐦᑯᐢ"
      },
      "senses": [{
        "definition": "star, little star"
      }],
      "key": "acahkos",
      "matched": true
    }
  },
  "lemma": {
    "sro": "acâhkos"
  },
  "senses": [{
    "category": "n",
    "definition": "A star.",
    "semanticDomains": ["sky", "star", "sun"],
    "semanticIndices": ["1.1", "1.1.1.2", "1.1.1"],
    "dataSource": "MD"
  }],
  "key": "acahkos"
}
```

### _achimaw_ 'a story is told about him'

There was no MD > CW mapping for this MD entry, and no corresponding CW entry was easily found. Possibly _acimow_ 's/he tells, s/he tells a story'.

```json
{
  "dataSources": {
    "MD": {
      "English_POS":       "A_DET story#story_N is#be_V told#tell_V about_PREP him#he_PRON ._",
      "English_Search":    "a story is told about him.",
      "RapidWordIndices":  "3.5; 4.2; 3.5.4",
      "RapidWordsClasses": "communication; social_activity; story",
      "definition":        "A story is told about him.",
      "lemma":             {
        "md":        "achimaw",
        "syllabics": "ᐊᒋᒪᐤ"
      },
      "senses": [{
        "category":        "v",
        "definition":      "A story is told about him.",
        "semanticDomains": ["communication", "social_activity", "story"],
        "semanticIndices": ["3.5", "4.2", "3.5.4"]
      }]
    }
  },
  "lemma": {
    "sro": "achimaw"
  },
  "senses": [{
    "category":        "v",
    "definition":      "A story is told about him.",
    "semanticDomains": ["communication", "social_activity", "story"],
    "semanticIndices": ["3.5", "4.2", "3.5.4"],
    "dataSource":      "MD"
  }],
  "key": "achimaw"
}
```

## Results

stat               |  value
-------------------|------:
+ total CW entries | 21,709
+ total MD entries |  8,953
- mapped entries   |  5,152
**expected total** | 25,510
**actual total**   | 26,034
**difference**     |    524

Import process is not currently commutative:

import order | # entries
-------------|---------:
MD, CW       |    26,829
CW, MD       |    26,034

[Run build script.]


## Next Steps (for Parity with itwêwina)

- [ ] process POS information from individual data sources and standardize it on a canonical set of POS + inflectional classes
- [ ] import into itwêwina, adjusting ALTLab database entries if needed (potential pain point: multiple senses)
