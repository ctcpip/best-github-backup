import db from './db.mjs';
import { archivePath, dataPath, gitPath, gitRepoArchivePath } from './org-path.mjs';
import fs from 'node:fs';
import { run } from './shelly.mjs';
import stats from './stats.mjs';
import { debug, log } from './util.mjs';
import args from './args.mjs';
import { updateState } from './create-read-update.mjs';
import options from './options.mjs';
import assert from 'node:assert/strict';

export default async function archiveIt() {
  const { org } = args;
  const now = Date.now();

  log(`archiving org '${org}'...`);

  await updateState({ lastRunArchive: now, org }, 'updating lastRunArchive');

  const cmdOptions = Object.freeze({ timeout: 60 * 5 });  // 5 minute timeout

  const promises = [];

  fs.mkdirSync(archivePath, { recursive: true });

  promises.push(archiveGitHubData(cmdOptions));

  if (options.includeGitRepo) {
    fs.mkdirSync(gitRepoArchivePath, { recursive: true });
    const repos = (await db.find('repo')).payload.records;

    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];
      promises.push(archiveGitRepo(cmdOptions, repo));
    }
  }

  await Promise.all(promises);
  log(`archive complete; location: ${archivePath}`);
  await updateState({ lastSuccessRunArchive: now }, 'updating lastSuccessRunArchive');
}

async function archiveGitHubData(cmdOptions) {
  const prefix = 'github-data.tar.gz.';

  const existingFiles = fs.readdirSync(archivePath).filter(filename => filename.startsWith(prefix));

  for (const file of existingFiles) {
    fs.unlinkSync(`${archivePath}/${file}`);
  }

  const cmd = `tar zcf - -C '${dataPath}' db | split -b 64m - '${archivePath}/${prefix}'`;
  await run(cmd, cmdOptions);

  if (existingFiles) {
    stats.update('githubArchive');
  }
  else {
    stats.create('githubArchive');
  }
}

async function archiveGitRepo(baseCmdOptions, repo) {
  const gitRepoPath = `${gitPath}/${repo.name}`;

  if (!fs.existsSync(gitRepoPath)) {
    throw new Error(`'${repo.name}' - git repo missing`);
  }

  const cmdOptions = { ...baseCmdOptions, cwd: gitRepoPath };
  const repoHEADTip = await run(`git rev-parse HEAD`, cmdOptions);
  const bundlePath = `${gitRepoArchivePath}/${repo.name}`;
  const bundleExists = fs.existsSync(bundlePath);

  if (bundleExists) {
    const bundleHEADTip = await getBundleHEADTip(bundlePath);

    if (bundleHEADTip === repoHEADTip) {
      debug(`'${repo.name}' - bundle is up-to-date; skipping`);
      return;
    }
  }

  await run('git gc --auto', cmdOptions);
  await run(`git bundle create '${bundlePath}' HEAD`, cmdOptions);
  const bundleHEADTip = await getBundleHEADTip(bundlePath, cmdOptions);
  assert.equal(bundleHEADTip, repoHEADTip, `'${repo.name}' bundle tip ${bundleHEADTip} does not match repo tip ${repoHEADTip}`);

  if (bundleExists) {
    stats.update('gitRepoArchive');
  }
  else {
    stats.create('gitRepoArchive');
  }
}

async function getBundleHEADTip(bundlePath) {
  const stdout = await run(`git bundle list-heads '${bundlePath}'`);
  return stdout.split(' ')[0];
}

// add full / all / mirror option arg
// which will pull --mirror on git clone
// and will do bundle --all
