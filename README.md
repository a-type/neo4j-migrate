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
    operation: create # operation is optional, defaults to create
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
    name: testIndex
    labels:
      - Post
    properties:
      - title
      - text
    # removing a property index
  - type: node_label_property
    operation: delete # specify delete as operation
    label: Person
    properties:
      - email
    # removing a fulltext index (name only required)
  - type: node_fulltext
    operation: delete
    name: oldIndex
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
