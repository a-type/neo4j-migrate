import { MigrationFile, MigrationDirection } from './types';

export default (
  allMigrations: MigrationFile[],
  fromVersion: number,
  toVersion: number,
  direction: MigrationDirection,
): MigrationFile[] => {
  if (direction === MigrationDirection.Up) {
    return allMigrations.filter(
      migration => fromVersion < migration.version && migration.version <= toVersion,
    );
  } else {
    return allMigrations.filter(
      migration => toVersion < migration.version && migration.version <= fromVersion,
    );
  }
};
