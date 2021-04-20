import createKey from './createKey.js';

/**
 * Create a homograph key given a lemma and an index of keys. Existing keys with the same lemma will have their homograph number updated, but the new key will **not** be added.
 * @param  {String} lemma The lemma to create a key for.
 * @param  {Map}    keys  A Map whose keys are the existing set of homograph keys.
 * @return {String}
 */
export default function createHomographKey(lemma, keys) {

  const asciiKey     = createKey(lemma);
  let   homographNum = 1;
  let   homographKey = asciiKey;

  // Iteratively checks whether the current key exists,
  // and updates the homograph key and existing keys as appropriate.
  const setHomographNum = () => {

    const existingEntry = keys.get(asciiKey + homographNum) ?? keys.get(asciiKey);

    // If no entry exists for this lemma yet, return the current homograph key.
    if (!existingEntry) return;

    // If the existing entry doesn't yet have a homograph number,
    // set homograph number to 1 and update the set of keys.
    if (homographNum === 1) {
      keys.delete(homographKey);
      homographKey += 1;
      keys.set(homographKey, existingEntry);
    }

    // If the existing entry has a homograph number,
    // increment the homograph number
    // and check for the key again.
    homographNum++;
    homographKey = asciiKey + homographNum;
    setHomographNum();

  };

  setHomographNum();

  return homographKey;

}
