import fortune from 'fortune';
import fsAdapter from 'fortune-fs';
import schema from './scheme-a-little-schema-of-me.mjs';
import { dbPath } from './path.mjs';

export default fortune(schema, {
  adapter: [fsAdapter, { path: dbPath }],
  settings: { enforceLinks: true },
});
