import util from 'node:util';
import options from './options.mjs';

// enable debug logging with env var:
// NODE_DEBUG=BEST-GITHUB-BACKUP
const debugLog = util.debuglog('BEST-GITHUB-BACKUP');

function logWithTimestamp(txt, debug) {

  const logTxt = typeof txt === 'string' ? txt : JSON.stringify(txt);

  const timeStamp = (new Date()).toISOString().replace('T', ' ').replace(/\.\d+Z/, '');
  const logMessage = logTxt.split('\n').map(t => `${timeStamp} - ${t}`).join('\n');

  if (debug){
    // prioritize cli argument over environment variable
    if (options.verbose){
      console.debug(logMessage);
    }
    else {
      debugLog(logMessage);
    }
  }
  else {
    console.log(logMessage);
  }
}

const debug = txt => logWithTimestamp(txt, true);
const log = txt => logWithTimestamp(txt, false);

export {
  debug,
  log,
};
