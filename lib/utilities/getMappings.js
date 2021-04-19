import readTSV from './readTSV.js';

/**
 * Reads the MD > CW mappings file and returns a Map of entries. If there is more than one record with the same MD headword, the value of the entry in the Map will be an Array of mappings rather than a single mapping.
 * @param  {String}       mappingsPath The path to the mappings file.
 * @return {Promise<Map>}              Returns a Promise that resolves to the Map of entries.
 */
export default async function getMappings(mappingsPath) {

  const columns = [
    'lemma_MD',
    'lemma_CW',
    'definition_MD',
    'definition_CW',
    'matchType',
    'FST',
  ];

  const records  = await readTSV(mappingsPath, { columns });
  const mappings = new Map;

  for (const record of records) {

    const mapping = mappings.get(record.lemma_MD);

    if (mapping) {
      if (Array.isArray(mapping)) mapping.push(record);
      else mappings.set(record.lemma_MD, [mapping, record]);
    } else {
      mappings.set(record.lemma_MD, record);
    }

  }

  return mappings;

}
