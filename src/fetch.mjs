import { debug } from './util.mjs';
import {
  markRepoAsDeleted,
  updateIssue,
  updateIssueComment,
  updateRepo,
  updateReviewComment,
  updateState,
  updateUser,
} from './create-read-update.mjs';
import db from './db.mjs';
import { api, rateLimitLock } from './api.mjs';
import args from './args.mjs';
import options from './options.mjs';
import state from './state.mjs';

const { org } = args;

// pattern to match GHSA-IDs. see https://docs.github.com/en/code-security/security-advisories/working-with-global-security-advisories-from-the-github-advisory-database/about-the-github-advisory-database#about-ghsa-ids
const reGHSA = /ghsa(-[23456789cfghjmpqrvwx]{4}){3}/;

async function fetchIssueComments(repo, repoIssues, repoState) {
  const promises = [];
  const params = {
    owner: org,
    repo: repo.name,
    per_page: 100,
  };

  if (!options.forceUpdate) {
    params.since = since(repoState.lastSuccessIssueComments);
  }

  await rateLimitLock.gimme();
  debug(`'${repo.name}' - fetching issue comments`);
  const now = Date.now();

  for await (const response of api.paginate.iterator(
    `GET /repos/{owner}/{repo}/issues/comments`,
    params,
  )) {
    debug(`'${repo.name}' - issue comments data received`);
    for (const c of response.data) {
      promises.push(updateIssueComment(c, repoIssues));
    }
  }

  rateLimitLock.bye();

  await Promise.all(promises);
  repoState.lastSuccessIssueComments = now;
  await updateState({ repo: state.repo }, `'${repo.name}' - updating lastSuccessIssueComments`);
}

async function fetchIssues(repo, repoState) {
  const promises = [];
  const params = {
    owner: org,
    repo: repo.name,
    per_page: 100,
    state: 'all',
  };

  if (!options.forceUpdate) {
    params.since = since(repoState.lastSuccessIssues);
  }

  await rateLimitLock.gimme();
  debug(`'${repo.name}' - fetching issues`);
  const now = Date.now();

  for await (const response of api.paginate.iterator(
    `GET /repos/{owner}/{repo}/issues`,
    params,
  )) {
    debug(`'${repo.name}' - issues data received`);
    for (const i of response.data) {
      promises.push(updateIssue(i, repo.id));
    }
  }

  rateLimitLock.bye();

  await Promise.all(promises);
  repoState.lastSuccessIssues = now;
  await updateState({ repo: state.repo }, `'${repo.name}' - updating lastSuccessIssues`);
}

async function fetchMembers(threshold) {
  let now = Date.now();

  if (!options.forceUpdate && state.lastSuccessMembers + threshold > now) {
    debug(`members fetched within the last ${options.daysThreshold} day(s); skipping`);
  }
  else {
    const promises = [];
    await rateLimitLock.gimme();
    debug('fetching members');
    now = Date.now();

    for await (const response of api.paginate.iterator(
      'GET /orgs/{org}/members',
      {
        org,
        per_page: 100,
      },
    )) {
      debug(`members data received`);
      for (const m of response.data) {
        promises.push(updateUser(m));
      }
    }

    rateLimitLock.bye();

    await Promise.all(promises);
    await updateState({ lastSuccessMembers: now }, 'updating lastSuccessMembers');
  }
}

async function fetchRepos() {
  const promises = [];
  const activeRepoNames = new Set();

  await rateLimitLock.gimme();
  debug('fetching repos');
  const now = Date.now();

  for await (const response of api.paginate.iterator(
    'GET /orgs/{org}/repos',
    {
      org,
      per_page: 100,
    },
  )) {
    debug(`repos data received`);
    for (const r of response.data) {
      if (!reGHSA.test(r.name)) { // skip GHSA repos
        activeRepoNames.add(r.name);
        promises.push(updateRepo(r));
      }
    }
  }

  rateLimitLock.bye();

  await Promise.all(promises);

  // check for deleted repos
  const existingRepos = (await db.find('repo')).payload.records;
  const deletedRepos = existingRepos.filter(r => !r.deleted && !activeRepoNames.has(r.name));

  if (deletedRepos.length > 0) {
    debug(`found ${deletedRepos.length} deleted repos: ${deletedRepos.map(r => r.name).join(', ')}`);
    for (const repo of deletedRepos) {
      await markRepoAsDeleted(repo);
    }
  }

  await updateState({ lastSuccessRepos: now }, 'updating lastSuccessRepos');
}

async function fetchReviewComments(repo, repoIssues, repoState) {
  const promises = [];
  const params = {
    owner: org,
    repo: repo.name,
    per_page: 100,
  };

  if (!options.forceUpdate) {
    params.since = since(repoState.lastSuccessReviewComments);
  }

  await rateLimitLock.gimme();
  debug(`'${repo.name}' - fetching review comments`);
  const now = Date.now();

  for await (const response of api.paginate.iterator(
    `GET /repos/{owner}/{repo}/pulls/comments`,
    params,
  )) {
    debug(`'${repo.name}' - review comments data received`);
    for (const c of response.data) {
      promises.push(updateReviewComment(c, repoIssues));
    }
  }

  rateLimitLock.bye();

  await Promise.all(promises);
  repoState.lastSuccessReviewComments = now;
  await updateState({ repo: state.repo }, `'${repo.name}' - updating lastSuccessReviewComments`);
}

function since(timestamp) {
  if (timestamp && !options.forceUpdate) {
    return new Date(timestamp).toISOString();
  }

  return undefined;
}

export {
  fetchIssueComments,
  fetchIssues,
  fetchMembers,
  fetchRepos,
  fetchReviewComments,
};
