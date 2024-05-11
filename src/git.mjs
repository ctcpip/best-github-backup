import fs from 'node:fs';
import { gitPath } from './org-path.mjs';
import { run } from './shelly.mjs';
import { debug } from './util.mjs';
import stats from './stats.mjs';
import args from './args.mjs';

async function backupGitRepo(repo) {
  const gitRepoPath = `${gitPath}/${repo.name}`;
  const clone = !fs.existsSync(gitRepoPath);
  const cmdOptions = { timeout: 60 * 5 };  // 5 minute timeout
  let stdout;

  debug(`'${repo.name}' - fetching git repo`);

  const cloneURL = new URL(repo.cloneURL);
  const url = `https://${args.token}@${cloneURL.host}${cloneURL.pathname}`;

  if (clone) {
    stdout = await run(`git clone --single-branch '${url}' '${gitRepoPath}'`, cmdOptions);
  }
  else {
    stdout = await run(`git -C '${gitRepoPath}' pull`, cmdOptions);
  }

  if (clone) {
    stats.clone();
  }
  else if (stdout !== 'Already up to date.') {
    stats.update('gitRepo');
  }
}

export { backupGitRepo };
