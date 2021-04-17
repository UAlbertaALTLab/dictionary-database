import createKey from './createKey.js';

/**
 * Sets the "key" field on each entry.
 * @param {Array} entry The Array of database entries.
 */
export default function setKeys(entries) {

  const keys = new Map;

  for (const entry of entries) {

    const key = createKey(entry.lemma.sro);
    let homographNum = 1;

    entry.key = key;

    // Iteratively checks whether the current key exists, and adds / updates
    // homograph numbers if so.
    const checkKey = () => {

      const existingEntry = keys.get(entry.key);

      if (existingEntry) {

        // If the existing entry doesn't yet have a homograph number,
        // add homograph number 1 to it and update the map of keys.
        if (homographNum === 1) {
          keys.delete(key);
          existingEntry.key += 1;
          keys.set(existingEntry.key, existingEntry);
        }

        // Update the current homograph number and key for the current entry
        homographNum++;
        entry.key = key + homographNum;
        checkKey();

      }

    };

    checkKey();
    keys.set(entry.key, entry);

  }

}
