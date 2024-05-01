import { cwd as getCWD } from 'node:process';
import path from 'node:path';
import fortune from 'fortune';
import fsAdapter from 'fortune-fs';
import schema from './scheme-a-little-schema-of-me.mjs';

const cwd = getCWD();

export default fortune(schema, {
  adapter: [fsAdapter, { path: path.join(cwd, 'data') }],
  settings: { enforceLinks: true },
});
