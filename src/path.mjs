import { fileURLToPath } from 'url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), '../');

const packageJSONPath = path.join(__dirname, '/package.json');

export { packageJSONPath };
