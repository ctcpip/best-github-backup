import util from 'node:util';
import { fileURLToPath } from 'url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), '../');

const debugLog = util.debuglog('BEST-GITHUB-BACKUP');

function logWithTimestamp(txt, debug) {

  const logTxt = typeof txt === 'string' ? txt : JSON.stringify(txt);

  const timeStamp = (new Date()).toISOString().replace('T', ' ').replace(/\.\d+Z/, '');
  const logMessage = logTxt.split('\n').map(t => `${timeStamp} - ${t}`).join('\n');

  if (debug){
    debugLog(logMessage);
  }
  else {
    console.log(logMessage);
  }
}

const debug = txt => logWithTimestamp(txt, true);
const log = txt => logWithTimestamp(txt, false);

export {
  __dirname,
  debug,
  log,
};
