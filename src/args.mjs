import { parseArgs } from 'node:util';
import pkgJSON from './pkgJSON.mjs';

/* eslint-disable @stylistic/js/object-property-newline, @stylistic/js/no-multi-spaces */
const args = parseArgs({
  options: {
    days:     { type: 'string',   short: 'd' },  // daysThreshold
    exclude:  { type: 'string',   short: 'e' },  // excludeRepos
    force:    { type: 'boolean',  short: 'f' },  // forceUpdate
    git:      { type: 'boolean',  short: 'g' },  // includeGitRepo
    help:     { type: 'boolean',  short: 'h' },
    org:      { type: 'string',   short: 'o' },
    token:    { type: 'string',   short: 't' },
    version:  { type: 'boolean',  short: 'v' },
  },
  strict: false,
});
/* eslint-enable */

function validateArgs() {

  let allGood = true;

  switch (true) {
    case args.values.help:
    case args.positionals.includes('help'):
      console.log('do a help');
      allGood = false;
      break;
    case args.values.version:{
      console.log(`${pkgJSON.name} v${pkgJSON.version} - ${pkgJSON.homepage}`);
      allGood = false;
      break;}
    default:
      break;
  }

  if (!allGood){
    return allGood;  // exit early
  }

  if (!args.values.org){
    console.error('org argument is required');
    allGood = false;
  }

  if (!args.values.token) {
    console.error('token argument is required');
    allGood = false;
  }

  if (args.values.days && !Number.isInteger(Number(args.values.days))) {
    console.error('days is not an integer');
    allGood = false;
  }

  if (!allGood) {
    console.error(`can't do anything 😿`);
    process.exitCode = 3;
  }

  return allGood;

}

export default args.values;
export { validateArgs };
