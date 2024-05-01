import db from './db.mjs';
import args, { validateArgs } from './args.mjs';
import { log } from './util.mjs';
import { updateRepoLastSuccessRun, updateState } from './CRU.mjs';
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
  log(`options: ${JSON.stringify(options)}`);
  log(`state: ${JSON.stringify(state)}`);
  log(`backing up org '${org}'...`);
  await updateState({ lastRun: now }, 'updating lastRun');

  const issueCacheIsLoaded = db.find('issue').then(i => issueCache.load(i.payload.records));

  try {
    await fetchMembers(threshold);
    await fetchRepos(threshold);

    for (const r of (await db.find('repo')).payload.records) {

      if (options.excludeRepos?.includes(r.name)) {
        continue;
      }

      if (!options.forceUpdate && r.lastSuccessRun + threshold > now) {
        log(`${r.name} repo fetched within the last ${options.daysThreshold} day(s), skipping...`);
      }
      else {
        log('loading issue cache');
        await issueCacheIsLoaded;
        log(`processing repo '${r.name}'...`);
        await fetchIssues(r);
        const issues = issueCache.get().filter(i => i.repo === r.id);
        await fetchIssueComments(r, issues);
        await fetchReviewComments(r, issues);
        await updateRepoLastSuccessRun(r, Date.now());
        await updateState({ checkpoint: r.id }, 'updating checkpoint');
      }
    }
  }
  catch (error) {
    console.error('Error: ', error.message);
    throw error;
  }

  await updateState({ lastSuccessRun: now }, 'updating lastSuccessRun');
  log('...done!\n');
};
