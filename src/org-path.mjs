import path from 'node:path';
import args from './args.mjs';
import { cwd as nodeCWD } from 'node:process';

const cwd = nodeCWD();
const { org } = args;

/* eslint-disable @stylistic/js/no-multi-spaces */

const dataPath            = path.join(cwd, `/data/${org}`);
const archivePath         = path.join(cwd, `/data/${org}/archive`);
const gitRepoArchivePath  = path.join(cwd, `/data/${org}/archive/gitRepoBundles`);
const dbPath              = path.join(cwd, `/data/${org}/db`);
const gitPath             = path.join(cwd, `/data/${org}/git`);

/* eslint-enable */

export {
  archivePath,
  dataPath,
  dbPath,
  gitPath,
  gitRepoArchivePath,
};
