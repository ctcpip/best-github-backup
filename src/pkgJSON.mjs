import { readFileSync } from 'node:fs';
import { cwd as getCWD } from 'node:process';
import path from 'node:path';

const cwd = getCWD();

// import attributes when?
export default JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8').toString());
