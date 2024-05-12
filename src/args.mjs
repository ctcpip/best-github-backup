import { parseArgs } from 'node:util';
import help from './help.mjs';

/* eslint-disable @stylistic/js/key-spacing, @stylistic/js/no-multi-spaces */
const args = parseArgs({
  options: {
    archive:  { type: 'boolean',  short: 'a' },
    days:     { type: 'string',   short: 'd' },  // daysThreshold
    exclude:  { type: 'string',   short: 'e' },  // excludeRepos
    force:    { type: 'boolean',  short: 'f' },  // forceUpdate
    git:      { type: 'boolean',  short: 'g' },  // includeGitRepos
    help:     { type: 'boolean',  short: 'h' },
    org:      { type: 'string',   short: 'o' },
    token:    { type: 'string',   short: 't' },
    verbose:  { type: 'boolean',  short: 'v' },
    version:  { type: 'boolean'              },
  },
  strict: false,
});
/* eslint-enable */

function validateArgs() {
  let allGood = true;
  let helpMe = false;

  switch (true) {
    case args.values.help:
    case args.positionals.includes('help'):
      help();
      helpMe = true;
      allGood = false;
      break;
    case args.values.version:{
      // version is already printed on every run,
      // so just exit
      allGood = false;
      break;
    }
    default:
      break;
  }

  if (!allGood) {
    return { allGood, helpMe }; // exit early
  }

  const errors = [];

  if (!args.values.org) {
    errors.push('org argument is required');
    allGood = false;
  }

  if (!args.values.token) {
    errors.push('token argument is required');
    allGood = false;
  }

  if (args.values.days && !Number.isInteger(Number(args.values.days))) {
    errors.push('days is not an integer');
    allGood = false;
  }

  if (!allGood) {
    errors.push(`can't do anything 😿`);
    process.exitCode = 3;
  }

  return { allGood, errors, helpMe };
}

export default args.values;
export { validateArgs };
