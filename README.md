# neo4j-migrate

A tool for running immutable migrations on a Neo4J database

## Usage

> NOTE: this project is in active development. All usage below is still speculative and in progress. No guarantees are made that usage will stay consistent in the near future, although semver will be used to indicate breaking changes.

### Create a migration file

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
- kind: Constraint
  type: node_unique_property
  label: Person
  property: id
# example of arbitrary cypher migration, which may or may not be reversible
- kind: Cypher
  up: 'MATCH (p:Person) SET p.name = trim(p.name)'
  down: null
```

### Migrate up

```
$ npx neo4j-migrate up --url bolt://localhost:7687
```

Migrates the database up, running each migration file in order. See `-h` for more options.

### Migrate down

```
$ npx neo4j-migrate down --url bolt://localhost:7687
```

Migrates the database down, UNDOING each migration file in REVERSE order. See `-h` for more options.

Note that Cypher change sets must supply a `down` parameter to be reversed. Otherwise, they will be skipped.

## Future

- [ ] Use APOC's static data storage to store the current schema version, then skip to that version during migration
