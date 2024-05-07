import args from './args.mjs';

const {
  archive,
  days: rawDaysThreshold,
  exclude: rawExcludeRepos,
  force: forceUpdate,
  git: includeGitRepo,
  verbose,
} = args;

export default {
  archive,
  daysThreshold: rawDaysThreshold && Number(rawDaysThreshold),
  excludeRepos: rawExcludeRepos?.split(',').filter(r => r).map(r => r.trim()),
  forceUpdate,
  includeGitRepo,
  verbose,
};
