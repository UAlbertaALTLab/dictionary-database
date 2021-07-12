import writeNDJSON from '../utilities/writeNDJSON.js';

export default async function convertCW(toolboxPath, outputPath) {
  const entries = [];
  await writeNDJSON(outputPath, entries);
  return entries;
}
