import { Octokit } from 'octokit';
import args from './args.mjs';

export default new Octokit({ auth: args.token });
