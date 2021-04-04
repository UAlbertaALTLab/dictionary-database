import { promises as fsPromises } from 'fs';

const { writeFile } = fsPromises;

export default async function convertCW(inputPath, outputPath) {

  if (!inputPath) {
    throw new Error(`Please provide the path to the Maskwacîs database as the first argument.`);
  }

  if (!outputPath) {
    throw new Error(`Please provide the path where you would like the converted file generated as the second argument`);
  }

  await writeFile(outputPath, `{}`);

}
