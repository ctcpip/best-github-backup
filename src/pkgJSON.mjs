import { readFileSync } from 'node:fs';

// import attributes when?
export default JSON.parse(readFileSync('package.json', 'utf8').toString());
