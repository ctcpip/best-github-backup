import { debug } from './util.mjs';
import {
  updateIssue,
  updateIssueComment,
  updateRepo,
  updateReviewComment,
  updateState,
  updateUser,
} from './create-read-update.mjs';
import { api, rateLimitLock } from './api.mjs';
import args from './args.mjs';
import options from './options.mjs';
import state from './state.mjs';

const { org } = args;

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

async function fetchRepos(threshold) {
  let now = Date.now();

  if (!options.forceUpdate && state.lastSuccessRepos + threshold > now) {
    debug(`repos fetched within the last ${options.daysThreshold} day(s); skipping`);
  }
  else {
    const promises = [];
    await rateLimitLock.gimme();
    debug('fetching repos');
    now = Date.now();

    for await (const response of api.paginate.iterator(
      'GET /orgs/{org}/repos',
      {
        org,
        per_page: 100,
      },
    )) {
      debug(`repos data received`);
      for (const r of response.data) {
        promises.push(updateRepo(r));
      }
    }

    rateLimitLock.bye();

    await Promise.all(promises);

    await updateState({ lastSuccessRepos: now }, 'updating lastSuccessRepos');
  }
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
