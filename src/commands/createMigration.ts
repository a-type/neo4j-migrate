import { readdirSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import getMigrationFileVersion from '../getMigrationFileVersion';

const template = `---
# simple property index
# - kind: index
#   type: node_label_property
#   operation: create # operation is optional, defaults to create
#   label: Person
#   properties:
#     - id

# compound property index
# - kind: index
#   type: node_label_property
#   label: Person
#   properties:
#     - name
#     - bio

# fulltext index (Neo4j 3.5+)
# - kind: index
#   type: node_fulltext
#   name: testindex
#   labels:
#     - Post
#   properties:
#     - title
#     - text

# removing a property index
# - kind: index
#   type: node_label_property
#   operation: delete # specify delete as operation
#   label: Person
#   properties:
#     - email

# removing a fulltext index (name only required)
# - kind: index
#   type: node_fulltext
#   operation: delete
#   name: oldindex

# unique property constraint
# - kind: Constraint
#   type: node_unique_property
#   label: Person
#   property: id

# example of arbitrary cypher migration, which may or may not be reversible
# - kind: Cypher
#   up: 'MATCH (p:Person) SET p.name = trim(p.name)'
#   down: null
`;

export default {
  command: 'create-migration',
  describe: 'creates a new migration file',
  builder: {
    ['migration-dir']: {
      alias: 'd',
      default: './migrations',
      describe: 'directory to store migrations in'
    },
    name: {
      alias: 'n',
      default: 'migration',
      describe: 'a name for the migration'
    }
  },
  handler: (argv: { ['migration-dir']: string; name: string }) => {
    const dirPath = resolve(process.cwd(), argv['migration-dir']);
    let files: string[];

    try {
      files = readdirSync(dirPath);
    } catch (err) {
      try {
        mkdirSync(dirPath);
        files = [];
      } catch (err) {
        throw new Error(`Could not read or create migrations directory ${dirPath}`);
      }
    }

    const latest = files.sort().pop();
    let latestNumber = 0;
    if (latest) {
      latestNumber = getMigrationFileVersion(latest);
    }

    const filename = `${latestNumber + 1}`.padStart(3, '0') + '-' + argv.name + '.yaml';

    writeFileSync(resolve(dirPath, `${filename}`), template);

    console.info(`Created ${resolve(dirPath, filename)}`);
    process.exit(0);
  }
};
