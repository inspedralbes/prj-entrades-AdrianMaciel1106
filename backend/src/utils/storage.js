import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const FILE_PATH = join(DATA_DIR, 'db.json');

export async function saveToDisk(data) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[storage] Error saving to disk:', err);
  }
}

export async function loadFromDisk() {
  try {
    const content = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('[storage] Error loading from disk:', err);
    }
    return null;
  }
}
