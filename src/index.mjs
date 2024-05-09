#!/usr/bin/env node

import options from './options.mjs';
import backItUp from './back-it-up.mjs';
import archiveIt from './archive.mjs';
import args, { validateArgs } from './args.mjs';
import pkgJSON from './pkgJSON.mjs';
import { debug, log } from './util.mjs';
import state from './state.mjs';
import stats from './stats.mjs';

const { org } = args;

let booContinue = true;

console.log('\n');

console.log(`${pkgJSON.name} v${pkgJSON.version}\n`);
debug(`options: ${JSON.stringify(options, null, 2)}`);
debug(`state: ${JSON.stringify(state, null, 2)}`);

if (!validateArgs()) {
  console.log('\n');
  booContinue = false;
}

if (state.org && state.org !== org) {
  console.error(`\nspecified org '${org}' does not match DB org '${state.org}'. can't continue\n`);
  booContinue = false;
}

if (booContinue) {
  let fatalError;
  try {
    if (options.archive) {
      await archiveIt();
    }
    else {
      await backItUp();
    }
  }
  catch (error) {
    fatalError = error;
  }

  log(`\nbackup summary:\n\n${stats.print()}\n`);

  if (fatalError) {
    console.error(`Fatal error: ${fatalError.message}\n\n${fatalError.stack}`);
  }
  else {
    log('...done!\n');
  }
}
