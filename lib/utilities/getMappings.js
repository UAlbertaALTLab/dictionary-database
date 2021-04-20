import readTSV from './readTSV.js';

/**
 * Create a unique key for a MD > CW mapping.
 * @param  {Object} mapping The mapping to create a key for.
 * @return {String}
 */
function createKey({ lemma_MD, definition_MD }) {
  return `${ lemma_MD }:${ definition_MD }`;
}

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
    'fstStem',
  ];

  const records  = await readTSV(mappingsPath, { columns });
  const mappings = new Map;

  for (const record of records) {

    record.lemma_CW = record.lemma_CW.replace(/1:\s+/u, '');

    const key     = createKey(record);
    const mapping = mappings.get(key);

    if (mapping) {
      if (Array.isArray(mapping)) mapping.push(record);
      else mappings.set(key, [mapping, record]);
    } else {
      mappings.set(key, record);
    }

  }

  return mappings;

}
