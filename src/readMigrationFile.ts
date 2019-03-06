import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { Migration } from './types';
import getMigrationFileVersion from './getMigrationFileVersion';

export type MigrationFile = {
  migration: Migration;
  version: number;
  name: string;
};

export default (filePath: string): MigrationFile => {
  try {
    const file = readFileSync(filePath, 'utf8');
    const fileName = (file.split('/').pop() || 'unknown').replace('.yaml', '');
    const parsed = parse(file) as Migration;

    return {
      name: fileName,
      version: getMigrationFileVersion(fileName),
      migration: parsed
    };
  } catch (err) {
    console.error(`Failed to read migration file: ${filePath}`);
    throw err;
  }
};
