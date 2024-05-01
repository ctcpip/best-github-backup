import db from './db.mjs';
import { log } from './util.mjs';
import api from './api.mjs';
import issueCache from './issue-cache.mjs';

async function addUserIfMissing(u) {  // eslint-disable-line no-unused-vars
  const user = (await db.find('user', [u.id])).payload.records[0];
  if (!user) {
    const missingUser = (await api.request('GET /users/{username}', { username: u.login })).data;
    await updateUser(missingUser);
  }
}

/**
 * finds or creates a record
 */
async function getRecord(type, id, createdAt, fields = {}){
  let r = (await db.find(type, [id])).payload.records[0];

  if (!r) {
    log(`creating ${type} ${id}`);

    r = (await db.create(type, [
      Object.assign(
        {
          id,
          createdAt: Date.parse(createdAt),
        },
        fields,
      ),
    ])).payload.records[0];

    if (type === 'issue') {
      issueCache.push(r);
    }
  }

  return r;
}

async function updateIssue(i, repoID) {
  const updated = Date.parse(i.updated_at);

  const fields = {
    body: i.body,
    isPullRequest: Boolean(i.pull_request),
    number: i.number,
    repo: repoID,
    state: i.state,
    title: i.title,
    user: i.user.id,
    updatedAt: updated,
  };

  const issue = await getRecord('issue', i.id, i.created_at, fields);

  if (issue.updatedAt !== updated) {
    log(`updating issue ${i.id}`);

    await db.update('issue', [{
      id: i.id,
      replace: fields,
    }]);
  }
}

async function updateIssueComment(c, issues) {
  let comment = (await db.find('issueComment', [c.id])).payload.records[0];
  const updated = Date.parse(c.updated_at);

  if (comment) { // update

    if (comment.updatedAt !== updated) {
      log(`updating issueComment ${c.id}`);
      await db.update('issueComment', [{
        id: c.id,
        replace: {
          body: c.body,
          updatedAt: updated,
        },
      }]);
    }
  }
  else { // create

    // find the issue id by querying the issue number
    const issueNumber = Number(c.issue_url.match(/\d+$/)[0]);
    const issue = issues.find(i => i.number === issueNumber);
    let issueID;

    if (issue) {
      issueID = issue.id;
    }
    else {
      // it's possible to have orphaned comments 😿
      console.error(`couldn't find issue for ${JSON.stringify(c)}`);
    }

    log(`creating issueComment ${c.id}`);
    comment = (await db.create('issueComment', [
      {
        id: c.id,
        createdAt: Date.parse(Date.parse(c.created_at)),
        body: c.body,
        issue: issueID || null,
        user: c.user.id,
        updatedAt: updated,
      },
    ])).payload.records[0];
  }
}

async function updateRepo(r) {
  const updated = Date.parse(r.updated_at);
  const fields = {
    name: r.name,
    updatedAt: updated,
  };

  const repo = await getRecord('repo', r.id, r.created_at, fields);

  if (repo.updatedAt !== updated) {
    log(`updating repo ${r.name}`);

    await db.update('repo', [{
      id: r.id,
      replace: fields,
    }]);
  }
}

async function updateRepoLastSuccessRun(r, lastSuccessRun) {
  log(`updating repo.lastSuccessRun`);

  await db.update('repo', [{
    id: r.id,
    replace: { lastSuccessRun },
  }]);
}

async function updateReviewComment(c, issues) {
  let comment = (await db.find('reviewComment', [c.id])).payload.records[0];
  const updated = Date.parse(c.updated_at);

  if (comment) { // update

    if (comment.updatedAt !== updated) {
      log(`updating reviewComment ${c.id}`);
      await db.update('reviewComment', [{
        id: c.id,
        replace: {
          body: c.body,
          updatedAt: updated,
        },
      }]);
    }
  }
  else { // create

    // find the issue id by querying the issue number
    const issueNumber = Number(c.pull_request_url.match(/\d+$/)[0]);
    const issue = issues.find(i => i.number === issueNumber);
    let issueID;

    if (issue) {
      issueID = issue.id;
    }
    else {
      // it's possible to have orphaned comments 😿
      console.error(`couldn't find issue for ${JSON.stringify(c)}`);
    }

    log(`creating reviewComment ${c.id}`);
    comment = (await db.create('reviewComment', [
      {
        id: c.id,
        createdAt: Date.parse(Date.parse(c.created_at)),
        body: c.body,
        issue: issueID || null,
        user: c.user.id,
        updatedAt: updated,
      },
    ])).payload.records[0];
  }
}

async function updateState(fields, logMessage = 'updating state'){
  log(logMessage);

  await db.update('state', [{
    id: 1,
    replace: fields,
  }]);
}

async function updateUser(u) {
  const user = await getRecord('user', u.id, u.created_at, { login: u.login });

  if (!user.name) {
    log(`updating user ${u.id}`);
    const userData = (await api.request('GET /users/{username}', { username: u.login })).data;
    const name = userData.name || 'null';

    await db.update('user', [{
      id: u.id,
      replace: { name },
    }]);
  }
}

export {
  getRecord,
  updateIssue,
  updateIssueComment,
  updateRepo,
  updateRepoLastSuccessRun,
  updateReviewComment,
  updateState,
  updateUser,
};

// find issues and whatever else that has a user association
// but we don't have user data for them
// and add/update the users
