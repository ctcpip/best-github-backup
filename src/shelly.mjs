import util from 'node:util';
import childProcess from 'node:child_process';
import { debug } from './util.mjs';

const exec = util.promisify(childProcess.exec);
const { spawn } = childProcess;

/**
 * execute a shell command
 * @param { String } cmd
 * @param { Object } options
 * @param { String } options.cwd
 * @param { String } options.timeout timeout in seconds
 * @param { String } options.useSpawn
 * @returns { Object } { exitCode, stdout, stderr }
 */
export default async function shelly(cmd, { cwd, timeout, useSpawn } = {}) {

  const result = {};

  if (timeout) {
    timeout *= 1000;
  }
  else {
    timeout = 60 * 1000;
  }

  debug(`running command ${cmd} from dir ${cwd || process.cwd()}`);

  if (useSpawn === 'true') {
    const splitCMD = cmd.split(/ /g);

    try {
      spawn(splitCMD[0], splitCMD.slice(1), {
        stdio: 'ignore',
        detached: true,
        cwd,
        timeout,
      }).unref();
      result.exitCode = 0;
    }
    catch (error) {
      result.stderr = JSON.stringify(error);
    }
  }
  else {
    try {
      const { stdout, stderr } =
        await exec(`${cmd}`, {
          cwd,
          timeout,
        });
      result.exitCode = 0; // exit code is 0 if there was no error / rejected promise
      result.stdout = stdout ? stdout.trim() : '';
      result.stderr = stderr ? stderr.trim() : '';
    }
    catch (error) {
      result.exitCode = error.code;
      result.stdout = error.stdout ? error.stdout.trim() : '';
      result.stderr = error.stderr ? error.stderr.trim() : '';
    }

  }

  return result;

}
