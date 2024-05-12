import * as color from 'colorette';
import pkgJSON from './pkgJSON.mjs';
import { spawn } from 'node:child_process';

export default function help() {
  const backup = pkgJSON.name;

  const help =
`${backup.toLocaleUpperCase()}(1)       General Commands Manual       ${backup.toLocaleUpperCase()}(1)

${color.bold(color.whiteBright('NAME'))}
     ${color.bold(color.whiteBright(backup))} - the best GitHub backup program (trust me bro)

${color.bold(color.whiteBright('SYNOPSIS'))}
     ${color.bold(color.whiteBright(`${backup} -t`))} ${color.underline('token')} ${color.bold(color.whiteBright(`-o`))} ${color.underline('organization')} [${color.bold(color.whiteBright(`-afgv`))}] [${color.bold(color.whiteBright(`-d`))} ${color.underline('daysThreshold')}]
                        [${color.bold(color.whiteBright(`-e`))} ${color.underline('repo1')},${color.underline('repo2')},${color.underline('...')}]
     ${color.bold(color.whiteBright(`${backup} --help`))}
     ${color.bold(color.whiteBright(`${backup} --version`))}
     (See the OPTIONS section for alternate option syntax with long option
     names.)

${color.bold(color.whiteBright('DESCRIPTION'))}
     Takes a backup for a given GitHub organization of all repositories that
     the provided token can access.
     It will run in one of two modes:
       1. Backup mode (default), where information is pulled from GitHub, or
       2. Archive mode (option ${color.bold(color.whiteBright(`-a`))}), where compressed files are created for
       backups that have been taken already with backup mode.

${color.bold(color.whiteBright('OPTIONS'))}
     ${color.bold(color.whiteBright('-a'))}, ${color.bold(color.whiteBright('--archive'))}
            Create compressed files for archiving.

     ${color.bold(color.whiteBright('-d'))} ${color.underline('daysThreshold')}, ${color.bold(color.whiteBright('--days'))} ${color.underline('daysThreshold')}
            Skip backup for repos that have been successfully backed up within
            the last ${color.underline('daysThreshold')} days.

     ${color.bold(color.whiteBright('-e'))} ${color.underline('repo1')},${color.underline('repo2')},${color.underline('...')}, ${color.bold(color.whiteBright('--exclude'))} ${color.underline('repo1')},${color.underline('repo2')},${color.underline('...')}
            Exclude specified repos from backup.

            Note: this option is ignored in archive mode (option ${color.bold(color.whiteBright(`-a`))}).
            Archive mode will process whatever exists from the previously taken
            backup(s). If you want to exclude anything from the archive, it
            must have been excluded from all backups. If you are uncertain, you
            should delete the data folder (data/${color.underline('orgName')}) and take a new backup
            with the exclude option.

     ${color.bold(color.whiteBright('-f'))}, ${color.bold(color.whiteBright('--force'))}
            Force update GitHub content. (By default, we only query for new
            content since the last successful backup was taken.)

     ${color.bold(color.whiteBright('-g'))}, ${color.bold(color.whiteBright('--git'))}
            Clone (or update existing clone of) git repos.

     ${color.bold(color.whiteBright('-h'))}, ${color.bold(color.whiteBright('--help'))}
            🆘 HELP!

     ${color.bold(color.whiteBright('-o'))} ${color.underline('org')}, ${color.bold(color.whiteBright('--org'))} ${color.underline('org')}
            GitHub organization to backup.

     ${color.bold(color.whiteBright('-t'))} ${color.underline('token')}, ${color.bold(color.whiteBright('--token'))} ${color.underline('token')}
            GitHub token to use for authentication.

     ${color.bold(color.whiteBright('-v'))}, ${color.bold(color.whiteBright('--verbose'))}
            Verbose logging.

     ${color.bold(color.whiteBright('--version'))}
            Show version.

${color.bold(color.whiteBright('EXAMPLES'))}
     ${color.bold(color.whiteBright(`${backup} -t`))} ${color.underline('token')} ${color.bold(color.whiteBright(`-o`))} ${color.underline('organization')}
            Backup an organization.

     ${color.bold(color.whiteBright(`${backup} -t`))} ${color.underline('token')} ${color.bold(color.whiteBright(`-o`))} ${color.underline('organization')} ${color.bold(color.whiteBright(`-a`))}
            Create compressed files for archiving.

     ${color.bold(color.whiteBright(`${backup} -t`))} ${color.underline('token')} ${color.bold(color.whiteBright(`-o`))} ${color.underline('organization')} ${color.bold(color.whiteBright(`-g`))}
            Backup an organization, including git repositories.

     ${color.bold(color.whiteBright(`${backup} -t`))} ${color.underline('token')} ${color.bold(color.whiteBright(`-o`))} ${color.underline('organization')} ${color.bold(color.whiteBright(`-ag`))}
            Create compressed files for archiving, including git repositories.

     ${color.bold(color.whiteBright(`${backup} -t`))} ${color.underline('token')} ${color.bold(color.whiteBright(`-o`))} ${color.underline('organization')} ${color.bold(color.whiteBright(`-g`))} ${color.bold(color.whiteBright(`-e`))} ${color.underline('repo1')},${color.underline('repo2')},${color.underline('...')}
            Backup an organization, including git repositories, but excluding
            some repositories.

${color.bold(color.whiteBright('VERSION'))}
     ${pkgJSON.version}

`;

  const less = spawn('less', ['-R'], { stdio: ['pipe', process.stdout, process.stderr] });
  less.stdin.write(help);
  less.stdin.end();

  less.on('error', () => {
    // if this fails, it's likely because `less` is not available on the system
    console.log(help);
  });
}
