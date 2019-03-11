import { v1 as neo4j } from 'neo4j-driver';
import { MigrationDirection, ChangeSet } from './types';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import readMigrationFile from './readMigrationFile';
import { applyChangesetsUp, applyChangesetsDown } from './applyChangeSets';
import { getStoredVersion, setStoredVersion } from './storedVersion';
import getMigrationRange from './getMigrationRange';

type ApplyMigrationsParams = {
  driver: neo4j.Driver;
  migrationDirPath?: string;
  version?: number;
  direction: MigrationDirection;
  force?: boolean;
};

export default async ({
  driver,
  migrationDirPath = 'migrations',
  version,
  direction,
  force,
}: ApplyMigrationsParams) => {
  const session = driver.session();

  const dirPath = resolve(process.cwd(), migrationDirPath);

  let files = [];
  try {
    files = readdirSync(dirPath);
  } catch (err) {
    throw new Error(`Directory not found or not accessible: ${dirPath}`);
  }

  // sort in reverse for down
  const allMigrations = files
    .sort(
      direction === MigrationDirection.Up
        ? (a: string, b: string) => a.localeCompare(b)
        : (a: string, b: string) => b.localeCompare(a),
    )
    .map(filename => resolve(dirPath, filename))
    .map(readMigrationFile);

  if (allMigrations.length === 0) {
    throw new Error(`No migrations were found in ${dirPath}`);
  }

  const targetVersion =
    version !== undefined
      ? version
      : direction === MigrationDirection.Up
      ? allMigrations[allMigrations.length - 1].version
      : 0;
  const currentVersion = force ? null : await getStoredVersion(session);

  const migrations = getMigrationRange(
    allMigrations,
    currentVersion !== null
      ? currentVersion
      : direction === MigrationDirection.Up
      ? 0
      : allMigrations[0].version,
    targetVersion,
    direction,
  );

  if (migrations.length === 0) {
    console.info(
      `No migrations match version range; nothing to do.${
        currentVersion !== null ? ` Current version: ${currentVersion}` : ''
      }`,
    );
    return;
  }

  const apply = direction === MigrationDirection.Up ? applyChangesetsUp : applyChangesetsDown;

  try {
    await migrations.reduce<Promise<any>>(async (previousOperationPromise, { name, migration }) => {
      await previousOperationPromise;

      console.info(`${direction === MigrationDirection.Up ? 'Applying' : 'Reversing'} ${name}...`);
      await apply(migration, session);
    }, Promise.resolve());
  } catch (err) {
    console.error(`Failed to apply migration`);
    throw err;
  }

  await setStoredVersion(session, targetVersion);

  console.info(`All migrations applied`);
};
