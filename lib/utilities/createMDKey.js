/**
 * Create a unique key for an MD entry.
 * @param  {Object} mdEntry The MD entry to create a key for.
 * @return {String}
 */
export default function createMDKey({ definition, lemma }) {
  return `${ lemma.md }:${ definition }`;
}
