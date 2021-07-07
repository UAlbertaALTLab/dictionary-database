import loadEntries from './loadEntries.js';

const key = 'acâhkos kâ-osôsit';

void async function query() {

  const entries = await loadEntries('data/database.ndjson');
  const target  = entries.find(entry => entry.lemma.sro === key);

  console.log(target);

}();
