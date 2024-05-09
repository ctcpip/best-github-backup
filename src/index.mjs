#!/usr/bin/env node

import options from './src/options.mjs';
import backItUp from './src/back-it-up.mjs';
import archiveIt from './src/archive.mjs';

if (options.archive) {
  archiveIt();
}
else {
  backItUp();
}


