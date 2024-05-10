import db from './db.mjs';
import { debug } from './util.mjs';
import api from './api.mjs';
import issueCache from './issue-cache.mjs';
import Semaphore from './semaphore.mjs';
import stats from './stats.mjs';

const stateLock = new Semaphore(1);

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
async function getRecord(type, id, createdAt, fields = {}) {
  let r = (await db.find(type, [id])).payload.records[0];

  if (!r) {
    debug(`creating ${type} ${id}`);

    r = (await db.create(type, [
      Object.assign(
        {
          id,
          createdAt: Date.parse(createdAt),
        },
        fields,
      ),
    ])).payload.records[0];

    switch (type) {
      case 'state':
        // don't add a stat for state
        break;
      case 'issue':
        issueCache.push(r);
        // FALLS THROUGH
      default:
        stats.create(type);
        break;
    }
  }

  return r;
}

async function updateIssue(i, repoID) {
  const type = 'issue';
  const updated = Date.parse(i.updated_at);

  const fields = {
    body: i.body,
    isPullRequest: Boolean(i.pull_request),
    number: i.number,
    repo: repoID,
    state: i.state,
    title: i.title,
    user: i.user?.id || null,
    updatedAt: updated,
  };

  const issue = await getRecord(type, i.id, i.created_at, fields);

  if (issue.updatedAt !== updated) {
    debug(`updating ${type} ${i.id}`);

    await db.update(type, [{
      id: i.id,
      replace: fields,
    }]);

    stats.update(type);
  }
}

async function updateIssueComment(c, issues) {
  const type = 'issueComment';
  let comment = (await db.find(type, [c.id])).payload.records[0];
  const updated = Date.parse(c.updated_at);

  if (comment) { // update
    if (comment.updatedAt !== updated) {
      debug(`updating ${type} ${c.id}`);
      await db.update(type, [{
        id: c.id,
        replace: {
          body: c.body,
          updatedAt: updated,
        },
      }]);
      stats.update(type);
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
      console.error(`couldn't find issue for ${JSON.stringify(c, null, 2)}`);
    }

    debug(`creating ${type} ${c.id}`);
    comment = (await db.create(type, [
      {
        id: c.id,
        createdAt: Date.parse(Date.parse(c.created_at)),
        body: c.body,
        issue: issueID || null,
        user: c.user?.id || null,
        updatedAt: updated,
      },
    ])).payload.records[0];
    stats.create(type);
  }
}

async function updateRepo(r) {
  const type = 'repo';
  const updated = Date.parse(r.updated_at);
  const fields = {
    cloneURL: r.clone_url,
    name: r.name,
    updatedAt: updated,
  };

  const repo = await getRecord(type, r.id, r.created_at, fields);

  if (repo.updatedAt !== updated || !repo.cloneURL) {
    debug(`updating repo ${r.name}`);

    await db.update(type, [{
      id: r.id,
      replace: fields,
    }]);
    stats.update(type);
  }
}

async function updateReviewComment(c, issues) {
  const type = 'reviewComment';
  let comment = (await db.find(type, [c.id])).payload.records[0];
  const updated = Date.parse(c.updated_at);

  if (comment) { // update
    if (comment.updatedAt !== updated) {
      debug(`updating ${type} ${c.id}`);
      await db.update(type, [{
        id: c.id,
        replace: {
          body: c.body,
          updatedAt: updated,
        },
      }]);
      stats.update(type);
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
      console.error(`couldn't find issue for ${JSON.stringify(c, null, 2)}`);
    }

    debug(`creating ${type} ${c.id}`);
    comment = (await db.create(type, [
      {
        id: c.id,
        createdAt: Date.parse(Date.parse(c.created_at)),
        body: c.body,
        issue: issueID || null,
        user: c.user?.id || null,
        updatedAt: updated,
      },
    ])).payload.records[0];
    stats.create(type);
  }
}

async function updateState(fields, logMessage) {
  if (!logMessage) {
    throw new Error('logMessage is required');
  }

  debug(logMessage);

  await stateLock.gimme();
  await db.update('state', [{
    id: 1,
    replace: fields,
  }]);
  stateLock.bye();
}

async function updateUser(u) {
  const type = 'user';
  const user = await getRecord(type, u.id, u.created_at, { login: u.login });

  if (!user.name) {
    debug(`updating ${type} ${u.id}`);
    const userData = (await api.request('GET /users/{username}', { username: u.login })).data;
    const name = userData.name || 'null';

    await db.update(type, [{
      id: u.id,
      replace: { name },
    }]);
    stats.update(type);
  }
}

export {
  getRecord,
  updateIssue,
  updateIssueComment,
  updateRepo,
  updateReviewComment,
  updateState,
  updateUser,
};

// find issues and whatever else that has a user association
// but we don't have user data for them
// and add/update the users
