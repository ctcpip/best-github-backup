import { readFileSync } from 'node:fs';
import { packageJSONPath } from './path.mjs';

// import attributes when?
export default JSON.parse(readFileSync(packageJSONPath, 'utf8').toString());
