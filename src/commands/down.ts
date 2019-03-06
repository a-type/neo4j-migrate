import createDriver from '../createDriver';
import { MigrationDirection } from '../types';
import applyMigrations from '../applyMigrations';

type DownArgs = {
  ['migration-dir']: string;
  version: string;
  host: string;
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
      describe: 'directory where migrations are stored'
    },
    version: {
      alias: 'v',
      describe: 'version to migrate down to (defaults latest)'
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
  handler: async (argv: DownArgs) => {
    const config = argv['neo4j-config'] ? JSON.parse(argv['neo4j-config']) : undefined;

    const driver = createDriver({
      host: argv.host,
      username: argv.username,
      password: argv.password,
      config
    });

    await applyMigrations({
      driver,
      migrationDirPath: argv['migration-dir'],
      version: argv.version ? parseInt(argv.version, 10) : undefined,
      direction: MigrationDirection.Down
    });
  }
};
