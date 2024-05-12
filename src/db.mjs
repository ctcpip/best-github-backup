import fortune from 'fortune';
import fsAdapter from 'fortune-fs';
import schema from './scheme-a-little-schema-of-me.mjs';
import { dbPath } from './org-path.mjs';
import args from './args.mjs';

const { org } = args;
const fortuneOptions = { settings: { enforceLinks: false } };

if (org) {
  // if we don't have an org, we can't do anything,
  // so don't initialize the filesystem DB,
  // which creates erroneous folders at an `undefined` org path
  fortuneOptions.adapter = [fsAdapter, { path: dbPath }];
}

export default fortune(schema, fortuneOptions);
