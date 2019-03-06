import createDriver from '../createDriver';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import readMigrationFile from '../readMigrationFile';
import { ChangeSet } from '../types';
import { up } from '../applyChangeSets';

type UpArgs = {
  ['migration-dir']: string;
  version: string;
  host: string;
  username: string;
  password: string;
  config: string;
};

export default {
  command: 'up',
  describe: 'migrates the database up (optionally specify target version)',
  builder: {
    ['migration-dir']: {
      alias: 'd',
      default: './migrations',
      describe: 'directory where migrations are stored'
    },
    version: {
      alias: 'v',
      describe: 'version to migrate up to (defaults latest)'
    },
    host: {
      alias: 'h',
      describe: 'the host (and port) of the Neo4j database'
    },
    username: {
      alias: 'u',
      describe: 'the username for the Neo4j database',
      default: 'neo4j'
    },
    password: {
      alias: 'p',
      describe: 'the password for the Neo4j database (omit for no credentials)'
    },
    ['neo4j-config']: {
      alias: 'c',
      describe: 'json string of neo4j-driver config'
    }
  },
  handler: async (argv: UpArgs) => {
    const config = argv.config ? JSON.parse(argv.config) : undefined;

    const driver = createDriver({
      host: argv.host,
      username: argv.username,
      password: argv.password,
      config
    });

    const session = driver.session();

    const dirPath = resolve(process.cwd(), argv['migration-dir']);

    let files = [];
    try {
      files = readdirSync(dirPath);
    } catch (err) {
      throw new Error(`Directory not found or not accessible: ${dirPath}`);
    }

    let migrations = files.map(readMigrationFile).sort();

    if (argv.version) {
      const versionNumber = parseInt(argv.version, 10);
      migrations = migrations.filter(migration => migration.version <= versionNumber);
    }

    try {
      await migrations.reduce<Promise<any>>(
        async (previousOperationPromise, { name, migration }) => {
          await previousOperationPromise;

          console.info(`Applying ${name}...`);

          const allChangeSets: ChangeSet[] = [
            ...migration.indexes,
            ...migration.constraints,
            ...migration.cyphers
          ];
          await up(allChangeSets, session);
        },
        Promise.resolve()
      );
    } catch (err) {
      console.error(`Failed to apply migration`);
      throw err;
    }

    console.info(`All migrations applied`);
  }
};
