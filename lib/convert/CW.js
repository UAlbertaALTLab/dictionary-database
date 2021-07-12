import readToolbox from '../utilities/readToolbox.js';
import writeNDJSON from '../utilities/writeNDJSON.js';

/**
 * Remove punctuation from the head, returning the lemma.
 * @param  {String} string The head to convert.
 * @return {String}
 */
function head2lemma(string) {
  return string.replace(/[!?]/gu, ``);
}

/**
 * Convert a string in the proto-orthography (with <ý> or <ń>) to a Plains Cree SRO transcription (with <y> only).
 * @param  {String} string The string to transliterate.
 * @return {String}
 */
function proto2sro(string) {
  return string
  .normalize()
  .replace(/ń/gu, `y`)  // U+0144
  .replace(/ý/gu, `y`); // U+00FD
}

/**
 * A class representing a CW database entry in DaFoDiL format.
 */
class Entry {

  /**
   * Create a new CW database entry from the original Toolbox entry.
   * @param {Object} toolboxEntry A Toolbox entry (returned from `readToolbox.js`)
   */
  constructor({
    original,
    sro,
    syll,
    test,
  }) {

    this.original = original;
    this.test     = test;

    this.head = {
      proto: sro, // the CW \sro field is actually the proto-orthography
      sro:   proto2sro(sro),
      syll,
    };

    this.lemma = {
      proto: head2lemma(this.head.proto),
      sro:   head2lemma(this.head.sro),
      syll,  // punctuation never appears in this field in the Toolbox file
    };

  }

}

export default async function convertCW(toolboxPath, outputPath) {
  let entries = await readToolbox(toolboxPath);
  entries = entries.map(toolboxEntry => new Entry(toolboxEntry));
  await writeNDJSON(outputPath, entries);
  return entries;
}
