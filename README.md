# neo4j-migrate

A tool for running immutable migrations on a Neo4J database

## Usage

> NOTE: this project is in active development. All usage below is still speculative and in progress.

### Create a migration file

```
$ npx neo4j-migrate create-migration --name=example-migration ./migrations
```

Creates a file like this:

`000-example-migration.yaml`

```yaml
---
indexes:
  # simple property index
  - type: node_label_property
    label: Person
    properties:
      - id
    # compound property index
  - type: node_label_property
    label: Person
    properties:
      - name
      - bio
    # fulltext index (Neo4j 3.5+)
  - type: node_fulltext
    label: Post
    properties:
      - title
      - text
constraints:
  # unique property constraint
  - type: node_unique_property
    label: Person
    property: id
cyphers:
  # example of arbitrary cypher migration, which may or may not be reversible
  - up: 'MATCH (p:Person) SET p.name = trim(p.name)'
    down: null
```
