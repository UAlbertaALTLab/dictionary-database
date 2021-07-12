import proto2sro   from '../utilities/proto2sro.js';
import readToolbox from '../utilities/readToolbox.js';
import writeNDJSON from '../utilities/writeNDJSON.js';

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

    this.lemma = {
      proto: sro, // the CW \sro field is actually the proto-orthography
      sro:   proto2sro(sro),
      syll,
    };

  }

}

export default async function convertCW(toolboxPath, outputPath) {
  let entries = await readToolbox(toolboxPath);
  entries = entries.map(toolboxEntry => new Entry(toolboxEntry));
  await writeNDJSON(outputPath, entries);
  return entries;
}
