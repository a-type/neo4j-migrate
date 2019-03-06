import { readdirSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const template = `---
indexes: []
constraints: []
cyphers: []
`;

export default {
  command: 'create-migration',
  describe: 'creates a new migration file',
  builder: {
    migrationDir: {
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
  handler: (argv: { migrationDir: string; name: string }) => {
    const dirPath = resolve(process.cwd(), argv.migrationDir);
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
      const matches = latest.match(/^(\d+)-/);
      if (!matches) {
        // could probably be smarter about this
        throw new Error(
          'Files in the migration directory do not follow naming pattern (###-name.yml)'
        );
      }
      latestNumber = parseInt(matches[0], 10);
    }

    const filename = `${latestNumber}`.padStart(3, '0') + '-' + argv.name + '.yaml';

    writeFileSync(resolve(dirPath, `${filename}`), template);

    console.info(`Created ${resolve(dirPath, filename)}`);
  }
};
