import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { Migration, ChangeSetKind } from './types';
import getMigrationFileVersion from './getMigrationFileVersion';
import { sep } from 'path';

export type MigrationFile = {
  migration: Migration;
  version: number;
  name: string;
};

const validKinds = [ChangeSetKind.Index, ChangeSetKind.Constraint, ChangeSetKind.Cypher];

export default (filePath: string): MigrationFile => {
  try {
    const file = readFileSync(filePath, 'utf8');
    const fileName = (filePath.split(sep).pop() || 'unknown').replace('.yaml', '');
    const parsed = parse(file) as Migration;

    // some basic validation
    parsed.forEach(changeSet => {
      if (!changeSet.kind) {
        throw new Error(`ChangeSet ${JSON.stringify(changeSet)} must include kind`);
      } else if (!validKinds.includes(changeSet.kind)) {
        throw new Error(`ChangeSet ${JSON.stringify(changeSet)} kind must be one of ${validKinds}`);
      }
    });

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
