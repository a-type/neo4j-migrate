import {
  ChangeSet,
  IndexChangeSet,
  Neo4jIndexOrConstraintType,
  ConstraintChangeSet,
  ChangeSetOperationType,
} from './types';
import { isCypherChangeSet, isIndexChangeSet } from './guards';

const isCreate = (changeset: IndexChangeSet | ConstraintChangeSet, up: boolean) =>
  !changeset.operation || changeset.operation === ChangeSetOperationType.Create ? up : !up;

export const indexChangeSetToCypher = (changeset: IndexChangeSet, up: boolean): string => {
  if (isCreate(changeset, up)) {
    switch (changeset.type) {
      case Neo4jIndexOrConstraintType.NodeLabelProperty:
        return `CREATE INDEX ON :${changeset.label}(${changeset.properties.join(',')})`;
      case Neo4jIndexOrConstraintType.NodeFulltext:
        return `CALL db.index.fulltext.createNodeIndex(${JSON.stringify(
          changeset.name,
        )},${JSON.stringify(changeset.labels)},${JSON.stringify(changeset.properties)})`;
      case Neo4jIndexOrConstraintType.RelationshipFulltext:
        return `CALL db.index.fulltext.createRelationshipIndex(${JSON.stringify(
          changeset.name,
        )},${JSON.stringify(changeset.relationshipTypes)},${JSON.stringify(changeset.properties)})`;
    }
  } else {
    switch (changeset.type) {
      case Neo4jIndexOrConstraintType.NodeLabelProperty:
        return `DROP INDEX ON :${changeset.label}(${changeset.properties.join(',')})`;
      case Neo4jIndexOrConstraintType.NodeFulltext:
        return `CALL db.index.fulltext.drop(${JSON.stringify(changeset.name)})`;
      case Neo4jIndexOrConstraintType.RelationshipFulltext:
        return `CALL db.index.fulltext.drop(${JSON.stringify(changeset.name)})`;
    }
  }

  /* istanbul ignore next */
  throw new Error(`Index type is not supported: ${JSON.stringify(changeset)}`);
};

export const constraintChangeSetToCypher = (
  changeset: ConstraintChangeSet,
  up: boolean,
): string => {
  if (isCreate(changeset, up)) {
    switch (changeset.type) {
      case Neo4jIndexOrConstraintType.NodeUniqueProperty:
        return `CREATE CONSTRAINT ON (n:${changeset.label}) ASSERT n.${
          changeset.property
        } IS UNIQUE`;
    }
  } else {
    switch (changeset.type) {
      case Neo4jIndexOrConstraintType.NodeUniqueProperty:
        return `DROP CONSTRAINT ON (n:${changeset.label}) ASSERT n.${changeset.property} IS UNIQUE`;
    }
  }

  /* istanbul ignore next */
  throw new Error(`Constraint type is not supported: ${JSON.stringify(changeset)}`);
};

export const up = (changeSet: ChangeSet): string | null => {
  if (isCypherChangeSet(changeSet)) {
    return changeSet.up;
  } else if (isIndexChangeSet(changeSet)) {
    return indexChangeSetToCypher(changeSet, true);
  } else {
    return constraintChangeSetToCypher(changeSet, true);
  }
};

export const down = (changeSet: ChangeSet): string | null => {
  if (isCypherChangeSet(changeSet)) {
    return changeSet.down;
  } else if (isIndexChangeSet(changeSet)) {
    return indexChangeSetToCypher(changeSet, false);
  } else {
    return constraintChangeSetToCypher(changeSet, false);
  }
};
