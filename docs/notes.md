# Notes for Arok 2021-06-29

* I recovered the missing hyphens from the entries.

* These entries were missing a leading slash before the POS code, so I added it.

  - mamisîtot VTI<trust in s.t., depend on s.t. {AN}
  - masinistahikâkê VAI<use s.t. for embroidering {AN}
  - miskamâso <VAI<find (it/him) for oneself {AN, LB, LL}
  - paskwâwi moscosis NA<buffalo calf $[cf. paskwâwi moscosos ] {AN}
  - twâhikê VAI<make a hole in the ice {AN}

* These entries were missing POS codes, so I guessed at them. Let me know if these are correct.

  - sakapwânâhkw <stick for roasting $[cf. wC: apwânâskw ] {AN} (`NI`) [checked]
  - mêskotonamaw \exchange (it/him) with s.o. {AN} (`VTA`) [checked]

* These entries were missing the `<` before the definition, so I added it.

  - kisîpêkapitêhon \NItoothbrush $[see also kisîpêkinapitêwâkan  NI] {N 3}
  - kisîpêkinapitêwâkan \NItoothbrush $[see also kisîpêkapitêhon  NI] {N 3}
  - mostosowiyâs \NI\beef {AC, EM}

* The sources for these entries were formatted incorrectly, so I fixed them.

  - apahkwê \VAI<thatch s.t.; cover a dwelling (HW, BL}
  - macwêwês \NI<repeating gun, machine gun $[dim; cf. matwêwê ] [LB}
  - mâmamôwaskami kihci oyasiwêwin \NI<article of constitution $[pl: mamamôwaskami kihci oyasiwêwina "constitution"] (CC)
  - miyo ohpikinâwasowin \NI<good child rearing (TP)
  - miYoskaminowi pîsimw-\NA<spring month $["The Spring Months": March, April, and May] (4S)
  - papakiwayân \NI<shirt; blouse $[rdpl: also: pakowayân , papakôwayân ] AC, AN, EM, FC, N 3}

* These entries are spelled differently between the Word Perfect files and the Toolbox database, so I updated the Word Perfect files.

  - sakapwânâhkw > sakapwânâsk
  - mêskotonamaw > mêskotônamaw

# Todo

- [ ] Send list of manual changes I've made to Arok.
- [ ] Send list of entries without entries to Arok.
- [ ] Send list of entries without matches in Toolbox to Arok.
- [ ] **Korp:** Get statistics working.
- [ ] **Korp:** Show breadcrumbs for quickly identifying the location of a token.
- [ ] **Korp:** What's currently in the `dep` field should be in the `gloss` field.
- [ ] **corpus**: Get a list of all the forms in the corpus that aren't parsing correctly, so we can update the dictionaries and FST with them. We should build this step into the Korp pipeline, so that a report of unrecognized forms is produced each time Korp is updated.
- [ ] **Korp:** Support spell-relaxed searching. It might be that this is hard to do live, but we could index each form with various spell-relaxed forms.
- [ ] **Korp:** There are various morphophonological changes that operate between word boundaries, so sometimes words that undergo these changes are written in a reduced form: `êkwa êkwa` > `êk êkwa`.

# Notes

* The original list was all stems. You'll need to map the entries to the `\stm` field rather than the `\sro` field.
* A lot of the sources have been added partially through M.
* Sources should be listed alphabetically in the Toolbox file. This might need to be a new data cleaning step (as opposed to just a test).
