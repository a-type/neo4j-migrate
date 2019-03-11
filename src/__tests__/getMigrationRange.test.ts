import getMigrationRange from '../getMigrationRange';
import { MigrationDirection, MigrationFile } from '../types';

describe('getMigrationRange', () => {
  const migrations: MigrationFile[] = [
    {
      version: 1,
      name: 'first',
      migration: [],
    },
    {
      version: 2,
      name: 'second',
      migration: [],
    },
    {
      version: 3,
      name: 'third',
      migration: [],
    },
    {
      version: 4,
      name: 'fourth',
      migration: [],
    },
    {
      version: 5,
      name: 'fifth',
      migration: [],
    },
  ];

  describe('migrating up', () => {
    const direction = MigrationDirection.Up;

    test('resolves the correct range', () => {
      expect(getMigrationRange(migrations, 1, 5, direction).map(m => m.version)).toEqual([
        2,
        3,
        4,
        5,
      ]);
    });
  });

  describe('migrating down', () => {
    const direction = MigrationDirection.Down;
    const reversedMigrations = [...migrations].reverse();

    test('resolves the correct range', () => {
      expect(getMigrationRange(reversedMigrations, 4, 2, direction).map(m => m.version)).toEqual([
        4,
        3,
      ]);

      expect(getMigrationRange(reversedMigrations, 1, 0, direction).map(m => m.version)).toEqual([
        1,
      ]);
    });
  });
});
