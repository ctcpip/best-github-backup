import { fileURLToPath } from 'url';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import attributes when?
export default JSON.parse(readFileSync(path.resolve(__dirname, '../package.json'), 'utf8').toString());
