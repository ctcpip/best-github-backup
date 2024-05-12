import args from './args.mjs';

const {
  archive,
  days: rawDaysThreshold,
  exclude: rawExcludeRepos,
  force: forceUpdate,
  git: includeGitRepos,
  verbose,
} = args;

const daysThreshold = rawDaysThreshold && Number(rawDaysThreshold);

export default {
  archive,
  daysThreshold,
  excludeRepos: rawExcludeRepos?.split(',').filter(r => r).map(r => r.trim()),
  forceUpdate,
  includeGitRepos,
  verbose,
};

export const threshold = daysThreshold && daysThreshold * 24 * 60 * 60 * 1000;
