import { v1 as neo4j } from 'neo4j-driver';
import { MigrationDirection, ChangeSet } from './types';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import readMigrationFile from './readMigrationFile';
import { up, down } from './applyChangeSets';

type ApplyMigrationsParams = {
  driver: neo4j.Driver;
  migrationDirPath: string;
  version?: number;
  direction: MigrationDirection;
};

export default async ({ driver, migrationDirPath, version, direction }: ApplyMigrationsParams) => {
  const session = driver.session();

  const dirPath = resolve(process.cwd(), migrationDirPath);

  let files = [];
  try {
    files = readdirSync(dirPath);
  } catch (err) {
    throw new Error(`Directory not found or not accessible: ${dirPath}`);
  }

  // sort in reverse for down
  let migrations = files
    .sort(
      direction === MigrationDirection.Up
        ? (a: string, b: string) => a.localeCompare(b)
        : (a: string, b: string) => b.localeCompare(a)
    )
    .map(filename => resolve(dirPath, filename))
    .map(readMigrationFile);

  if (version !== undefined) {
    migrations = migrations.filter(migration => migration.version <= version);
  }

  const apply = direction === MigrationDirection.Up ? up : down;

  try {
    await migrations.reduce<Promise<any>>(async (previousOperationPromise, { name, migration }) => {
      await previousOperationPromise;

      console.info(`Applying ${name}...`);
      await apply(migration, session);
    }, Promise.resolve());
  } catch (err) {
    console.error(`Failed to apply migration`);
    throw err;
  }

  console.info(`All migrations applied`);
};
