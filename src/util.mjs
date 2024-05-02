import util from 'node:util';

const debugLog = util.debuglog('BEST-GITHUB-BACKUP');

function logWithTimestamp(txt, debug) {
  const logMessage = `${(new Date()).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')} - ${txt}`;

  if (debug){
    debugLog(logMessage);
  }
  else {
    console.log(logMessage);
  }
}

const debug = txt => logWithTimestamp(txt, true);
const log = txt => logWithTimestamp(txt, false);

export { debug, log };
