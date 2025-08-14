import db from './db.mjs';
import args from './args.mjs';
import { debug, log } from './util.mjs';
import { updateState } from './create-read-update.mjs';
import state from './state.mjs';
import {
  fetchIssueComments,
  fetchIssues,
  fetchMembers,
  fetchRepos,
  fetchReviewComments,
} from './fetch.mjs';
import options, { threshold } from './options.mjs';
import issueCache from './issue-cache.mjs';
import { backupGitRepo } from './git.mjs';

export default async function backItUp() {
  const { org } = args;
  const now = Date.now();

  log(`backing up org '${org}'`);

  await updateState({ lastRunBackup: now, org }, 'updating lastRunBackup');

  debug('loading issue cache');
  const issueCacheIsLoaded = db.find('issue').then(i => issueCache.load(i.payload.records));

  const promises = [];

  promises.push(fetchMembers(threshold));
  await fetchRepos();
  const repos = (await db.find('repo')).payload.records;

  for (let i = 0; i < repos.length; i++) {
    const r = repos[i];

    if (options.excludeRepos?.includes(r.name)) {
      continue;
    }

    const repoState = getRepoState(r.id);
    await issueCacheIsLoaded;

    if (r.deleted) {
      debug(`'${r.name}' is marked as deleted; skipping`);
      continue;
    }

    if (!options.forceUpdate && repoState.lastSuccessRun + threshold > now) {
      debug(`'${r.name}' fetched within the last ${options.daysThreshold} day(s); skipping`);
    }
    else {
      promises.push(processRepo(r, repoState, i, repos.filter(r => !r.deleted).length));
    }
  }

  await Promise.all(promises);
  await updateState({ lastSuccessRunBackup: now }, 'updating lastSuccessRunBackup');
};

async function processRepo(repo, repoState, repoIndex, totalRepos) {
  const promises = [];
  if (options.includeGitRepos) { promises.push(backupGitRepo(repo)); }
  debug(`started processing repo (${repoIndex + 1}/${totalRepos}) - '${repo.name}'`);
  await fetchIssues(repo, repoState);
  const issues = issueCache.get().filter(i => i.repo === repo.id);
  promises.push(fetchIssueComments(repo, issues, repoState));
  promises.push(fetchReviewComments(repo, issues, repoState));
  await Promise.all(promises);
  log(`finished processing repo (${repoIndex + 1}/${totalRepos}) - '${repo.name}'`);
  repoState.lastSuccessRun = Date.now();
  await updateState({ repo: state.repo }, `'${repo.name}' - updating lastSuccessRun`);
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
