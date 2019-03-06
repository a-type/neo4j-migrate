import { readdirSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import getMigrationFileVersion from '../getMigrationFileVersion';

const template = `---
indexes: []
constraints: []
cyphers: []
`;

export default {
  command: 'create-migration',
  describe: 'creates a new migration file',
  builder: {
    ['migration-dir']: {
      alias: 'd',
      default: './migrations',
      describe: 'directory to store migrations in'
    },
    name: {
      alias: 'n',
      default: 'migration',
      describe: 'a name for the migration'
    }
  },
  handler: (argv: { ['migration-dir']: string; name: string }) => {
    const dirPath = resolve(process.cwd(), argv['migration-dir']);
    let files: string[];

    try {
      files = readdirSync(dirPath);
    } catch (err) {
      try {
        mkdirSync(dirPath);
        files = [];
      } catch (err) {
        throw new Error(`Could not read or create migrations directory ${dirPath}`);
      }
    }

    const latest = files.sort().pop();
    let latestNumber = 0;
    if (latest) {
      latestNumber = getMigrationFileVersion(latest);
    }

    const filename = `${latestNumber}`.padStart(3, '0') + '-' + argv.name + '.yaml';

    writeFileSync(resolve(dirPath, `${filename}`), template);

    console.info(`Created ${resolve(dirPath, filename)}`);
  }
};
