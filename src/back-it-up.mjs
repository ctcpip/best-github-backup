import db from './db.mjs';
import args, { validateArgs } from './args.mjs';
import { debug, log } from './util.mjs';
import { updateState } from './CRU.mjs';
import state from './state.mjs';
import {
  fetchIssueComments,
  fetchIssues,
  fetchMembers,
  fetchRepos,
  fetchReviewComments,
} from './fetch.mjs';
import options from './options.mjs';
import issueCache from './issue-cache.mjs';
import pkgJSON from './pkgJSON.mjs';
import { backupGitRepo } from './git.mjs';
import stats from './stats.mjs';

export default async function backItUp() {

  console.log('\n');

  if (!validateArgs()) {
    console.log('\n');
    return;
  }

  const threshold = options.daysThreshold * 24 * 60 * 60 * 1000;
  const { org } = args;
  const now = Date.now();

  log(`${pkgJSON.name} v${pkgJSON.version}`);
  debug(`options: ${JSON.stringify(options)}`);
  debug(`state: ${JSON.stringify(state, null, 2)}`);

  if (state.org && state.org !== org) {
    throw new Error(`specified org '${org}' does not match DB org '${state.org}'. can't continue`);
  }

  log(`backing up org '${org}'...`);

  await updateState({
    lastRun: now,
    org,
  }, 'updating lastRun');

  debug('loading issue cache');
  const issueCacheIsLoaded = db.find('issue').then(i => issueCache.load(i.payload.records));

  const promises = [];

  try {
    promises.push(fetchMembers(threshold));
    await fetchRepos(threshold);
    const repos = (await db.find('repo')).payload.records;

    for (let i = 0; i < repos.length; i++) {
      const r = repos[i];

      if (options.excludeRepos?.includes(r.name)) {
        continue;
      }

      const repoState = getRepoState(r.id);
      await issueCacheIsLoaded;

      if (!options.forceUpdate && repoState.lastSuccessRun + threshold > now) {
        debug(`${r.name} repo fetched within the last ${options.daysThreshold} day(s), skipping...`);
      }
      else {
        promises.push(processRepo(r, repoState, i, repos.length));
      }
    }

    await Promise.all(promises);
  }
  catch (error) {
    console.error('Error: ', error.message);
    throw error;
  }
  finally {
    log(`\nbackup summary:\n\n${ stats.print() }\n`);
  }

  await updateState({ lastSuccessRun: now }, 'updating lastSuccessRun');
  log('...done!\n');
};

async function processRepo(repo, repoState, repoIndex, totalRepos) {
  const promises = [];
  if (options.includeGitRepo) { promises.push(backupGitRepo(repo)); }
  debug(`started processing repo (${repoIndex + 1}/${totalRepos}) - '${repo.name}'...`);
  await fetchIssues(repo, repoState);
  const issues = issueCache.get().filter(i => i.repo === repo.id);
  promises.push(fetchIssueComments(repo, issues, repoState));
  promises.push(fetchReviewComments(repo, issues, repoState));
  await Promise.all(promises);
  log(`finished processing repo (${repoIndex + 1}/${totalRepos}) - '${repo.name}'...`);
  repoState.lastSuccessRun = Date.now();
  await updateState({ repo: state.repo });
}

function getRepoState(repoID) {

  let repoState;

  if (state.repo) {
    repoState = state.repo[repoID];
    if (!repoState) {
      repoState = state.repo[repoID] = {};
    }
  }
  else {
    state.repo = { [repoID]: {} };
    repoState = state.repo[repoID];
  }

  return repoState;

}
