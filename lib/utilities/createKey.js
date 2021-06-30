/**
 * Create a human-readable key from a lemma
 * @param  {String} lemma The lemma, including hyphens
 * @return {String}       Returns an ASCII key with no spaces or hyphens
 */
export default function createKey(lemma = '') {
  return lemma
  // denormalize all characters into combining characters
  .normalize()
  // replace whitespace with underscores
  .replace(/\s+/gu, '_');
}
