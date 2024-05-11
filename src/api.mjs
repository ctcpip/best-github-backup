import { Octokit } from 'octokit';
import args from './args.mjs';
import Semaphore from './semaphore.mjs';

const api = new Octokit({ auth: args.token });

// GitHub's secondary rate limit rules effectively means that,
// with two concurrent requests, we will start to see failures
// after approximately one minute, so we throttle our requests
// to one at a time, because hitting the rate limit will slow
// us down even more.
const rateLimitLock = new Semaphore(1);

export {
  api,
  rateLimitLock,
};
