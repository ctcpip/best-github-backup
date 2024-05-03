import { readFileSync } from 'node:fs';
import path from 'node:path';
import { __dirname } from './util.mjs';

// import attributes when?
export default JSON.parse(readFileSync(path.resolve(__dirname, './package.json'), 'utf8').toString());
