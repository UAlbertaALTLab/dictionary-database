import { writeFile } from 'fs/promises';

export default function clearDatabase() {
  return writeFile('data/database.ndjson', '');
}
