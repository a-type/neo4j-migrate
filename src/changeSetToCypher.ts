import {
  ChangeSet,
  IndexChangeSet,
  Neo4jIndexOrConstraintType,
  ConstraintChangeSet,
  ChangeSetOperationType
} from './types';
import { isCypherChangeSet, isIndexChangeSet } from './guards';

export const indexChangeSetToCypher = (
  { index, operation }: IndexChangeSet,
  up: boolean
): string => {
  const create = operation === ChangeSetOperationType.Apply ? up : !up;

  if (create) {
    switch (index.type) {
      case Neo4jIndexOrConstraintType.NodeLabelProperty:
        return `CREATE INDEX ON :${index.label}(${index.properties.join(',')})`;
      case Neo4jIndexOrConstraintType.NodeFulltext:
        return `CALL db.index.fulltext.createNodeIndex(${JSON.stringify(
          index.name
        )},${JSON.stringify(index.labels)},${JSON.stringify(index.properties)})`;
      case Neo4jIndexOrConstraintType.RelationshipFulltext:
        return `CALL db.index.fulltext.createRelationshipIndex(${JSON.stringify(
          index.name
        )},${JSON.stringify(index.realtionshipTypes)},${JSON.stringify(index.properties)})`;
    }
  } else {
    switch (index.type) {
      case Neo4jIndexOrConstraintType.NodeLabelProperty:
        return `DROP INDEX ON :${index.label}(${index.properties.join(',')})`;
      case Neo4jIndexOrConstraintType.NodeFulltext:
        return `CALL db.index.fulltext.deleteNodeIndex(${JSON.stringify(index.name)})`;
      case Neo4jIndexOrConstraintType.RelationshipFulltext:
        return `CALL db.index.fulltext.deleteRelationshipIndex(${JSON.stringify(index.name)})`;
    }
  }

  throw new Error(`Index type is not supported: ${JSON.stringify(index)}`);
};

export const constraintChangeSetToCypher = (
  { constraint, operation }: ConstraintChangeSet,
  up: boolean
): string => {
  const create = operation === ChangeSetOperationType.Apply ? up : !up;

  if (create) {
    switch (constraint.type) {
      case Neo4jIndexOrConstraintType.NodeUniqueProperty:
        return `CREATE CONSTRAINT ON (n:${constraint.label}) ASSERT n.${
          constraint.property
        } IS UNIQUE`;
    }
  } else {
    switch (constraint.type) {
      case Neo4jIndexOrConstraintType.NodeUniqueProperty:
        return `DROP CONSTRAINT ON (n:${constraint.label}) ASSERT n.${
          constraint.property
        } IS UNIQUE`;
    }
  }

  throw new Error(`Constraint type is not supported: ${JSON.stringify(constraint)}`);
};

export const up = (changeSet: ChangeSet): string => {
  if (isCypherChangeSet(changeSet)) {
    return changeSet.up;
  } else if (isIndexChangeSet(changeSet)) {
    return indexChangeSetToCypher(changeSet, true);
  } else {
    return constraintChangeSetToCypher(changeSet, true);
  }
};

export const down = (changeSet: ChangeSet): string => {
  if (isCypherChangeSet(changeSet)) {
    return changeSet.down;
  } else if (isIndexChangeSet(changeSet)) {
    return indexChangeSetToCypher(changeSet, false);
  } else {
    return constraintChangeSetToCypher(changeSet, false);
  }
};
