import readToolbox from '../utilities/readToolbox.js';
import writeNDJSON from '../utilities/writeNDJSON.js';

export default async function convertCW(toolboxPath, outputPath) {
  let entries = await readToolbox(toolboxPath);
  entries = entries.map(({ original, test }) => ({ original, test }));
  await writeNDJSON(outputPath, entries);
  return entries;
}
