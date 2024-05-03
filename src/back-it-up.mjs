import db from './db.mjs';
import args, { validateArgs } from './args.mjs';
import { debug, log } from './util.mjs';
import { stats, updateState } from './CRU.mjs';
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

  const issueCacheIsLoaded = db.find('issue').then(i => issueCache.load(i.payload.records));

  try {
    await fetchMembers(threshold);
    await fetchRepos(threshold);

    const repos = (await db.find('repo')).payload.records;

    for (let i = 0; i < repos.length; i++) {
      const r = repos[i];

      if (options.excludeRepos?.includes(r.name)) {
        continue;
      }

      let repoState;

      if (state.repo) {
        repoState = state.repo[r.id];
        if (!repoState) {
          repoState = state.repo[r.id] = {};
        }
      }
      else {
        state.repo = { [r.id]: {} };
        repoState = state.repo[r.id];
      }

      if (!options.forceUpdate && repoState.lastSuccessRun + threshold > now) {
        log(`${r.name} repo fetched within the last ${options.daysThreshold} day(s), skipping...`);
      }
      else {
        debug('loading issue cache');
        await issueCacheIsLoaded;
        log(`processing repo (${i + 1}/${repos.length}) - '${r.name}'...`);
        await fetchIssues(r, repoState);
        const issues = issueCache.get().filter(i => i.repo === r.id);
        await fetchIssueComments(r, issues, repoState);
        await fetchReviewComments(r, issues, repoState);
        if (options.includeGitRepo) { await backupGitRepo(r); }
        repoState.lastSuccessRun = Date.now();
        await updateState({ repo: state.repo });
      }
    }
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
