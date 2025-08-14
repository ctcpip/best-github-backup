#!/usr/bin/env node

import args, { validationResult } from './args.mjs';
import options from './options.mjs';
import backItUp from './back-it-up.mjs';
import archiveIt from './archive.mjs';
import pkgJSON from './pkgJSON.mjs';
import { debug, log } from './util.mjs';
import state from './state.mjs';
import stats from './stats.mjs';
import * as color from 'colorette';

const { org } = args;

let booContinue = true;

const { allGood, errors, helpMe } = validationResult;

if (!helpMe) {
  console.log(color.magentaBright(`\n${pkgJSON.name} v${pkgJSON.version} - ${pkgJSON.homepage}\n`));

  if (!allGood) {
    console.error(color.redBright(errors.join('\n')));
    console.log(`\nrun \`${color.whiteBright('best-github-backup -h')}\` for help\n`);
  }
}

booContinue = allGood;

if (state.org && state.org !== org) {
  console.error(`\nspecified org '${org}' does not match DB org '${state.org}'. can't continue\n`);
  booContinue = false;
}

if (booContinue) {
  debug(`options: ${JSON.stringify(options, null, 2)}`);
  debug(`state: ${JSON.stringify(state, null, 2)}`);

  let fatalError;
  try {
    if (options.archive) {
      if (!state.lastSuccessRunBackup) {
        throw new Error(`no prior backup found; can't archive`);
      }

      await archiveIt();
    }
    else {
      await backItUp();
    }
  }
  catch (error) {
    fatalError = error;
  }

  if (stats.any() || !fatalError) {
    log(`\nsummary:\n\n${stats.print()}\n`);
  }

  if (fatalError) {
    process.exitCode = 33;
    console.error(color.redBright(`\nFatal error: ${fatalError.message}\n\n${fatalError.stack}\n\n${JSON.stringify(fatalError)}\n`));
  }
  else {
    log('...done!\n');
  }
}
