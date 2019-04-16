# neo4j-migrate

A tool for running immutable migrations on a Neo4J database

## Usage

> NOTE: this project is in active development. All usage below is still speculative and in progress. No guarantees are made that usage will stay consistent in the near future, although semver will be used to indicate breaking changes.

### Environment Variables

Certain environment variables can be defined to supply common parameters:

```
NEO4J_HOST=bolt://your-neo4j-host:7687
NEO4J_USERNAME=neo4j|your_username
NEO4J_PASSWORD=your_password
```

All of these parameters can also be supplied via the CLI or module usage, and will override environment parameters if you do so.

### Version bookmarking

By default, this tool will store a version bookmark in a node inside your graph with a `:Neo4jMigrateStorage` label. This bookmark is used to avoid re-applying migrations upon future `up` or `down` commands. While the default migrations should all be basically idempotent, custom Cypher migrations may not be, plus it's just faster.

If you want to disable this behavior, pass the `--force` flag. If you'd like to store the version bookmark in a different place, feel free to open a PR.

### CLI

#### Create a migration file

```
$ npx neo4j-migrate create-migration --name=example-migration ./migrations
```

Creates a file like this:

`000-example-migration.yaml`

```yaml
---
# simple property index
- kind: index
  type: node_label_property
  operation: create # operation is optional, defaults to create
  label: Person
  properties:
    - id
  # compound property index
- kind: index
  type: node_label_property
  label: Person
  properties:
    - name
    - bio
  # fulltext index (Neo4j 3.5+)
- kind: index
  type: node_fulltext
  name: testindex
  labels:
    - Post
  properties:
    - title
    - text
  # removing a property index
- kind: index
  type: node_label_property
  operation: delete # specify delete as operation
  label: Person
  properties:
    - email
  # removing a fulltext index (name only required)
- kind: index
  type: node_fulltext
  operation: delete
  name: oldindex
# unique property constraint
- kind: constraint
  type: node_unique_property
  label: Person
  property: id
# example of arbitrary cypher migration, which may or may not be reversible
- kind: cypher
  up: 'MATCH (p:Person) SET p.name = trim(p.name)'
  down: null
```

#### Migrate up

```
$ npx neo4j-migrate up --url bolt://localhost:7687
```

Migrates the database up, running each migration file in order. See `-h` for more options.

#### Migrate down

```
$ npx neo4j-migrate down --url bolt://localhost:7687
```

Migrates the database down, UNDOING each migration file in REVERSE order. See `-h` for more options.

Note that Cypher change sets must supply a `down` parameter to be reversed. Otherwise, they will be skipped.

### Module

#### Migrate up

```ts
import * as path from 'path';
import { up } from 'neo4j-migrate';

await up({
  // all parameters optional
  migrationDir: path.resolve(process.cwd(), 'migrations'),
  target: 3,
  url: 'bolt://localhost:7687',
  username: 'neo4j',
  password: 'secret',
  neo4jConfig: {
    logging: {
      level: 'debug',
    },
  },
  force: true,
});
```

#### Migrate down

```ts
import * as path from 'path';
import { down } from 'neo4j-migrate';

await down({
  // all parameters optional
  migrationDir: path.resolve(process.cwd(), 'migrations'),
  target: 3,
  url: 'bolt://localhost:7687',
  username: 'neo4j',
  password: 'secret',
  neo4jConfig: {
    logging: {
      level: 'debug',
    },
  },
  force: true,
});
```
