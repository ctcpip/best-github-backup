import path from 'node:path';
import fs from 'node:fs';
import { __dirname } from './util.mjs';
import shelly from './shelly.mjs';
import { debug } from './util.mjs';
import { stats } from './CRU.mjs';
import { log } from 'node:console';

const gitFolder = path.resolve(__dirname, './git');
const cmdOptions = { timeout: 60 * 5 };  // 5 minute timeout

async function backupGitRepo(repo) {
  const gitRepoPath = `${gitFolder}/${repo.name}`;
  const clone = !fs.existsSync(gitRepoPath);
  let cmdResult;

  log('fetching git repo...');

  if (clone) {
    cmdResult = await shelly(`git clone --single-branch ${repo.cloneURL} ${gitRepoPath}`, cmdOptions);
  }
  else {
    cmdResult = await shelly(`git -C ${gitRepoPath} pull`, cmdOptions);
  }

  if (cmdResult.exitCode === 0) {
    debug(cmdResult);

    if (clone){
      stats.clone();
    }
    else if (cmdResult.stdout !== 'Already up to date.') {
      stats.update('gitRepo');
    }
  }
  else {
    throw new Error(JSON.stringify(cmdResult));
  }
}

export { backupGitRepo };