import createKey from './createKey.js';

/**
 * Create a homograph key (an ASCII version of a lemma followed by a homograph number if multiple instances of that lemma exist) given a lemma and an index of keys.
 * @param  {String} lemma The lemma to create a key for.
 * @param  {Map}    keys  A Map whose keys are the existing set of homograph keys.
 * @return {String}
 */
export default function createHomographKey(lemma, keys) {

  const asciiKey     = createKey(lemma);
  let   homographNum = 1;
  let   homographKey = asciiKey;

  // Iteratively checks whether the current key exists,
  // and updates the homograph key if so.
  const setHomographNum = () => {

    const existingEntry = keys.get(homographKey);

    // If the existing entry doesn't yet have a homograph number,
    // set homograph number to 1 and update the set of keys.
    if (homographNum === 1) {
      keys.delete(homographKey);
      homographKey += 1;
      keys.set(homographKey, existingEntry);
      return;
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
