import args from './args.mjs';

const {
  days: rawDaysThreshold,
  exclude: rawExcludeRepos,
  force: forceUpdate,
  git: includeGitRepo,
} = args;

export default {
  daysThreshold: rawDaysThreshold && Number(rawDaysThreshold),
  excludeRepos: rawExcludeRepos?.split(',').filter(r => r).map(r => r.trim()),
  forceUpdate,
  includeGitRepo,
};
