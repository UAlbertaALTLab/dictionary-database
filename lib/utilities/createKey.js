/**
 * Create a human-readable key from a lemma
 * @param  {String} lemma The lemma, including hyphens
 * @return {String}       Returns an ASCII key with no spaces or hyphens
 */
export default function createKey(lemma = '') {

  // finds non-combining character followed by combining character
  const combiningRegExp = /(?<char>\P{Mark})(?<combiner>\p{Mark}+)/gu;

  return lemma
  // denormalize all characters into combining characters
  .normalize('NFD')
  // remove combining characters
  .replace(combiningRegExp, '$1')
  // lowercase
  .toLowerCase()
  // remove hyphens
  .replace(/-/gu, '')
  // replace whitespace with underscores
  .replace(/\s+/gu, '_');

}
