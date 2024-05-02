import { debug, log } from './util.mjs';
import {
  getRecord,
  updateIssue,
  updateIssueComment,
  updateRepo,
  updateReviewComment,
  updateState,
  updateUser,
} from './CRU.mjs';
import api from './api.mjs';
import db from './db.mjs';
import args from './args.mjs';
import options from './options.mjs';

const { org } = args;
const state = await getRecord('state', 1);

async function fetchIssueComments(repo, repoIssues, repoState){
  log('fetching issue comments...');
  const now = Date.now();
  const promises = [];
  const params = {
    owner: org,
    repo: repo.name,
    per_page: 100,
  };

  if (!options.forceUpdate) {
    params.since = since(repoState.lastSuccessIssueComments);
  }

  for await (const response of api.paginate.iterator(
    `GET /repos/{owner}/{repo}/issues/comments`,
    params,
  )) {
    debug('data received');
    for (const c of response.data) {
      promises.push(updateIssueComment(c, repoIssues));
    }
  }

  await Promise.all(promises);
  repoState.lastSuccessIssueComments = now;
  await updateState( state.repo );
}

async function fetchIssues(repo, repoState){
  log('fetching issues...');
  const now = Date.now();
  const promises = [];
  const params = {
    owner: org,
    repo: repo.name,
    per_page: 100,
    state: 'all',
  };

  if (!options.forceUpdate){
    params.since = since(repoState.lastSuccessIssues);
  }

  for await (const response of api.paginate.iterator(
    `GET /repos/{owner}/{repo}/issues`,
    params,
  )) {
    debug('data received');
    for (const i of response.data) {
      promises.push(updateIssue(i, repo.id));
    }
  }

  await Promise.all(promises);
  repoState.lastSuccessIssues = now;
  await updateState( state.repo );
}

async function fetchMembers(threshold){

  const now = Date.now();

  if (!options.forceUpdate && state.lastSuccessMembers + threshold > now) {
    log(`members fetched within the last ${options.daysThreshold} day(s), skipping...`);
  }
  else {
    log('fetching members...');
    const now = Date.now();
    const promises = [];

    for await (const response of api.paginate.iterator(
      'GET /orgs/{org}/members',
      {
        org,
        per_page: 100,
      },
    )) {
      debug('data received');
      for (const m of response.data) {
        promises.push(updateUser(m));
      }
    }

    await Promise.all(promises);
    await updateState({ lastSuccessMembers: now });
  }

}

async function fetchRepos(threshold){

  const now = Date.now();

  if (!options.forceUpdate && state.lastSuccessRepos + threshold > now) {
    log(`repos fetched within the last ${options.daysThreshold} day(s), skipping...`);
  }
  else {

    log('fetching repos...');

    const promises = [];

    for await (const response of api.paginate.iterator(
      'GET /orgs/{org}/repos',
      {
        org,
        per_page: 100,
      },
    )) {
      debug('data received');
      for (const r of response.data) {
        promises.push(updateRepo(r));
      }
    }

    await Promise.all(promises);

    await updateState({ lastSuccessRepos: now });

  }

}

async function fetchReviewComments(repo, repoIssues, repoState){

  log('fetching review comments...');

  const now = Date.now();
  const promises = [];
  const params = {
    owner: org,
    repo: repo.name,
    per_page: 100,
  };

  if (!options.forceUpdate) {
    params.since = since(repoState.lastSuccessReviewComments);
  }

  for await (const response of api.paginate.iterator(
    `GET /repos/{owner}/{repo}/pulls/comments`,
    params,
  )) {
    debug('data received');
    for (const c of response.data) {
      promises.push(updateReviewComment(c, repoIssues));
    }
  }

  await Promise.all(promises);
  repoState.lastSuccessReviewComments = now;
  await updateState( state.repo );
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
