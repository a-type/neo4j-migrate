import createDriver from '../createDriver';
import { MigrationDirection } from '../types';
import applyMigrations from '../applyMigrations';

type DownArgs = {
  ['migration-dir']: string;
  target: string;
  url: string;
  username: string;
  password: string;
  ['neo4j-config']: string;
};

export default {
  command: 'down',
  describe: 'migrates the database down (optionally specify target version)',
  builder: {
    ['migration-dir']: {
      alias: 'd',
      default: './migrations',
      describe: '[d]irectory where migrations are stored'
    },
    target: {
      alias: 't',
      describe: '[t]arget version to migrate down to (defaults latest)'
    },
    url: {
      describe: 'the url (host and port) of the Neo4j database'
    },
    username: {
      alias: 'u',
      describe: '[u]sername for the Neo4j database',
      default: 'neo4j'
    },
    password: {
      alias: 'p',
      describe: '[p]assword for the Neo4j database (omit for no credentials)'
    },
    ['neo4j-config']: {
      alias: 'c',
      describe: 'json string of neo4j-driver [c]onfig'
    }
  },
  handler: async (argv: DownArgs) => {
    const config = argv['neo4j-config'] ? JSON.parse(argv['neo4j-config']) : undefined;

    const driver = createDriver({
      host: argv.url,
      username: argv.username,
      password: argv.password,
      config
    });

    await applyMigrations({
      driver,
      migrationDirPath: argv['migration-dir'],
      version: argv.target !== undefined ? parseInt(argv.target, 10) : undefined,
      direction: MigrationDirection.Down
    });

    process.exit(0);
  }
};
