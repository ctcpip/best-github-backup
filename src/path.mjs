import { fileURLToPath } from 'url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), '../');

/* eslint-disable @stylistic/js/no-multi-spaces */
const dbPath           = path.join(__dirname, '/data');
const gitPath          = path.join(__dirname, '/git');
const packageJSONPath  = path.join(__dirname, '/package.json');
/* eslint-enable */

export {
  __dirname,
  dbPath,
  gitPath,
  packageJSONPath,
};
