# Word Classes

The word classes currently used in itwêwina are as follows (taken from [enums.py](https://github.com/UAlbertaALTLab/cree-intelligent-dictionary/blob/21018addd9e9b5921c27f26b9d7eb4a5a0b2105f/CreeDictionary/utils/enums.py)):

Abbreviation | Word Class
-------------|-----------
IPC          | particle
IPV          | preverb
N            | noun
PRON         | pronoun
V            | verb

# Inflectional Categories

select * FROM API_wordform
where is_lemma = 1
and as_is = 0
group by inflectional_category;

id,text,inflectional_category,pos,analysis,is_lemma,as_is,stem,lemma_id
35564,kinêpiko-maskotêhk,INM,IPC,kinêpiko-maskotêhk+Ipc+Prop,1,0,kinêpiko-maskotêw- [NI-2],35564
3102,piskihci,IPC,IPC,piskihci+Ipc,1,0,"",3102
2681949,namôya,IPC ;; IPJ,IPC,namôya+Ipc,1,0,"",2681949
12441,anohc kâ-kîsikâk,IPH,IPC,anohc kâ-kîsikâk+Ipc+Phr,1,0,"",12441
1625,kitatamihin,IPJ,IPC,kitatamihin+Ipc+Interj,1,0,atamih-,1625
1733,okakihcimosk,NA-1,N,okakihcimosk+N+A+Sg,1,0,okakihcimosk-,1733
3766,opîkopicikêw,NA-2,N,opîkopicikêw+N+A+Sg,1,0,opîkopicikêw-,3766
12330,kiskinwahamâtôtâpânâsk,NA-3,N,kiskinwahamâtôtâpânâsk+N+A+Sg,1,0,kiskinwahamâtôtâpânâskw-,12330
27875,osk-âya,NA-4,N,osk-âya+N+A+Obv,1,0,osk-ây-,27875
9331,wâpi-maskwa,NA-4w,N,wâpi-maskwa+N+A+Sg,1,0,wâpi-maskw-,9331
76457,wiyihkosa,NDA-1,N,wiyihkosa+N+A+D+Px3Sg+Obv,1,0,-iyihkos-,76457
201355,nitihtihkosiy,NDA-2,N,nitihtihkosiy+N+A+D+Px1Sg+Sg,1,0,-tihtihkosiy-,201355
487291,miyihkwak,NDA-3,N,miyihkwak+N+A+D+PxX+Pl,1,0,-iyihkw-,487291
1672714,nîwa,NDA-4,N,nîwa+N+A+D+Px1Sg+Sg,1,0,-îw-,1672714
203711,nîskwa,NDA-4w,N,nîskwa+N+A+D+Px1Sg+Sg,1,0,-îskw-,203711
13154,nitêyikom,NDI-1,N,nitêyikom+N+I+D+Px1Sg+Sg,1,0,-têyikom-,13154
220104,nitêyaniyâpiy,NDI-2,N,nitêyaniyâpiy+N+I+D+Px1Sg+Sg,1,0,-têyaniyâpiy-,220104
552406,nayakask,NDI-3,N,nayakask+N+I+D+Px1Sg+Sg,1,0,-ayakaskw-,552406
2441371,nipêminak,NDI-3?,N,nipêminak+N+I+D+Px1Sg+Sg,1,0,-pêminak(w)-,2441371
346415,nîki,NDI-4,N,nîki+N+I+D+Px1Sg+Sg,1,0,-îk-,346415
2284083,nîwas,NDI-5,N,nîwas+N+I+D+Px1Sg+Sg,1,0,-îwat-,2284083
1669,kipokwâcikan,NI-1,N,kipokwâcikan+N+I+Sg,1,0,kipokwâcikan-,1669
9761,ispatinaw,NI-2,N,ispatinaw+N+I+Sg,1,0,ispatinaw-,9761
3606,pêhowikamik,NI-3,N,pêhowikamik+N+I+Sg,1,0,pêhowikamikw-,3606
81389,askâwi,NI-4,N,askâwi+N+I+Sg,1,0,askâw-,81389
362894,pâstâhowi-mihko,NI-4w,N,pâstâhowi-mihko+N+I+Sg,1,0,pâstâhowi-mihkw-,362894
2621249,ôsi,NI-5,N,ôsi+N+I+Sg,1,0,ôs-,2621249
353954,awa,PrA,PRON,awa+Pron+Dem+Prox+A+Sg,1,0,"",353954
2364188,âcimow,VAI,V,âcimow+V+AI+Ind+3Sg,1,0,pimi-âcimo-,2364188
3703,âpahikâsow,VAI-1,V,âpahikâsow+V+AI+Ind+3Sg,1,0,âpahikâso-,3703
4094,nêstosin,VAI-2,V,nêstosin+V+AI+Ind+3Sg,1,0,nêstosin-,4094
214536,ostostotam,VAI-3,V,ostostotam+V+AI+Ind+3Sg,1,0,ostostot-,214536
41526,mispon,VII-1n,V,mispon+V+II+Ind+3Sg,1,0,mispon-,41526
48898,nîso-tipiskâw,VII-1v,V,nîso-tipiskâw+V+II+Ind+3Sg,1,0,nîso-tipiskâ-,48898
4898,sôniyâwan,VII-2n,V,sôniyâwan+V+II+Ind+3Sg,1,0,sôniyâwan-,4898
1791,nôtimâw,VII-2v,V,nôtimâw+V+II+Ind+3Sg,1,0,nôtimâ-,1791
2093036,wâsênâsin,VII-n,V,wâsênâsin+V+II+Ind+3Sg,1,0,wâsênâsin-,2093036
2582745,kwêtipipayiw,VII-v,V,kwêtipipayiw+V+II+Ind+3Sg,1,0,kâhkwêtipipayi-,2582745
1539,atamihêw,VTA-1,V,atamihêw+V+TA+Ind+3Sg+4Sg/PlO,1,0,atamih-,1539
2087,wâsênamawêw,VTA-2,V,wâsênamawêw+V+TA+Ind+3Sg+4Sg/PlO,1,0,wâsênamaw-,2087
3311,mâciswêw,VTA-3,V,mâciswêw+V+TA+Ind+3Sg+4Sg/PlO,1,0,mâcisw-,3311
6607,kispêwâtêw,VTA-4,V,kispêwâtêw+V+TA+Ind+3Sg+4Sg/PlO,1,0,kispêwât-,6607
1013446,ay-itêw,VTA-5,V,ay-itêw+V+TA+Ind+3Sg+4Sg/PlO,1,0,it-,1013446
2533,kâhtinam,VTI-1,V,kâhtinam+V+TI+Ind+3Sg,1,0,kâhtin-,2533
2322,nahêkâcihtâw,VTI-2,V,nahêkâcihtâw+V+TI+Ind+3Sg,1,0,nahêkâcihtâ-,2322
173437,oscoscocasiw,VTI-3,V,oscoscocasiw+V+TI+Ind+3Sg,1,0,oscoscocasi-,173437
