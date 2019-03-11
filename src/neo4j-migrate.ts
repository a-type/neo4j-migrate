import createDriver from './createDriver';
import applyMigrations from './applyMigrations';
import { MigrationDirection } from './types';

export type UpArgs = {
  migrationDir?: string;
  target?: string;
  url?: string;
  username?: string;
  password?: string;
  neo4jConfig?: { [key: string]: any };
  force?: boolean;
};

export const up = async (argv: UpArgs) => {
  const driver = createDriver({
    host: argv.url,
    username: argv.username,
    password: argv.password,
    config: argv.neo4jConfig,
  });

  await applyMigrations({
    driver,
    migrationDirPath: argv.migrationDir,
    version: argv.target !== undefined ? parseInt(argv.target, 10) : undefined,
    direction: MigrationDirection.Up,
    force: argv.force,
  });
};

export type DownArgs = {
  migrationDir?: string;
  target?: string;
  url?: string;
  username?: string;
  password?: string;
  neo4jConfig?: { [key: string]: any };
  force?: boolean;
};

export const down = async (argv: DownArgs) => {
  const driver = createDriver({
    host: argv.url,
    username: argv.username,
    password: argv.password,
    config: argv.neo4jConfig,
  });

  await applyMigrations({
    driver,
    migrationDirPath: argv.migrationDir,
    version: argv.target !== undefined ? parseInt(argv.target, 10) : undefined,
    direction: MigrationDirection.Down,
    force: argv.force,
  });
};
