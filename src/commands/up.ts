import { up } from '../neo4j-migrate';

export default {
  command: 'up',
  describe: 'migrates the database up (optionally specify target version)',
  builder: {
    ['migration-dir']: {
      alias: 'd',
      default: './migrations',
      describe: '[d]irectory where migrations are stored',
    },
    target: {
      alias: 't',
      describe: '[t]arget version to migrate up to (defaults latest)',
    },
    url: {
      describe: 'the url (host and port) of the Neo4j database',
    },
    username: {
      alias: 'u',
      describe: '[u]sername for the Neo4j database',
      default: 'neo4j',
    },
    password: {
      alias: 'p',
      describe: '[p]assword for the Neo4j database (omit for no credentials)',
    },
    ['neo4j-config']: {
      alias: 'c',
      describe: 'json string of neo4j-driver config',
    },
    force: {
      alias: 'f',
      describe:
        '[f]orce applying all migrations from the beginning, ignoring stored current migration bookmark',
    },
  },
  handler: async ({ neo4jConfig, ...rest }: any) => {
    const config = neo4jConfig ? JSON.parse(neo4jConfig) : undefined;
    await up({
      ...rest,
      neo4jConfig: config,
    });
    process.exit();
  },
};
