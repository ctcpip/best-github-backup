import path from 'node:path';
import args from './args.mjs';
import { __dirname } from './path.mjs';

const { org } = args;

/* eslint-disable @stylistic/js/no-multi-spaces */

const dataPath            = path.join(__dirname, `/data/${org}`);
const archivePath         = path.join(__dirname, `/data/${org}/archive`);
const gitRepoArchivePath  = path.join(__dirname, `/data/${org}/archive/gitRepoBundles`);
const dbPath              = path.join(__dirname, `/data/${org}/db`);
const gitPath             = path.join(__dirname, `/data/${org}/git`);

/* eslint-enable */

export {
  archivePath,
  dataPath,
  dbPath,
  gitPath,
  gitRepoArchivePath,
};
