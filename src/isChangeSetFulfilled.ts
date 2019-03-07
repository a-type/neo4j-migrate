import {
  ChangeSet,
  Index,
  Constraint,
  Neo4jIndexOrConstraintType,
  NodeLabelPropertyIndex,
  NodeFulltextIndex,
  RelationshipFulltextIndex,
  NodeUniquePropertyConstraint,
  ChangeSetOperationType
} from './types';
import { isCypherChangeSet, isIndexChangeSet, isConstraintChangeSet } from './guards';

export const areSetsEqual = (setA: string[], setB: string[]): boolean => {
  if (setA.length !== setB.length) {
    return false;
  }

  const [ok, withoutB] = setB.reduce<[boolean, string[]]>(
    ([okSoFar, prev], item) => {
      const without = prev.filter(entry => entry !== item);
      return [without.length === prev.length - 1, without];
    },
    [true, [...setA]]
  );

  return ok && withoutB.length === 0;
};

// this is really messy code... :(
const isChangeSetSubjectPresent = (
  changeSet: ChangeSet,
  existingIndexes: Index[],
  existingConstraints: Constraint[]
): boolean => {
  // we can't really track whether a cypher operation is already 'fulfilled' in the schema
  if (isCypherChangeSet(changeSet)) {
    return false;
  }

  if (isIndexChangeSet(changeSet)) {
    return existingIndexes.some(existingIndex => {
      if (existingIndex.type !== changeSet.type) {
        return false;
      }

      switch (changeSet.type) {
        case Neo4jIndexOrConstraintType.NodeLabelProperty:
          return (
            (existingIndex as NodeLabelPropertyIndex).label === changeSet.label &&
            areSetsEqual((existingIndex as NodeLabelPropertyIndex).properties, changeSet.properties)
          );
        case Neo4jIndexOrConstraintType.NodeFulltext:
          const existingNodeFulltext = existingIndex as NodeFulltextIndex;
          return (
            existingNodeFulltext.name === changeSet.name &&
            (!!existingNodeFulltext.labels &&
              !!changeSet.labels &&
              areSetsEqual(existingNodeFulltext.labels, changeSet.labels)) &&
            (!!existingNodeFulltext.properties &&
              !!changeSet.properties &&
              areSetsEqual(existingNodeFulltext.properties, changeSet.properties))
          );
        case Neo4jIndexOrConstraintType.RelationshipFulltext:
          const existingRelationshipFulltext = existingIndex as RelationshipFulltextIndex;
          return (
            (existingIndex as RelationshipFulltextIndex).name === changeSet.name &&
            (!!existingRelationshipFulltext.relationshipTypes &&
              !!changeSet.relationshipTypes &&
              areSetsEqual(
                existingRelationshipFulltext.relationshipTypes,
                changeSet.relationshipTypes
              )) &&
            (!!existingRelationshipFulltext.properties &&
              !!changeSet.properties &&
              areSetsEqual(existingRelationshipFulltext.properties, changeSet.properties))
          );
        default:
          return false;
      }
    });
  }

  if (isConstraintChangeSet(changeSet)) {
    return existingConstraints.some(existingConstraint => {
      if (existingConstraint.type !== changeSet.type) {
        return false;
      }

      switch (changeSet.type) {
        case Neo4jIndexOrConstraintType.NodeUniqueProperty:
          const existingNodeUnique = existingConstraint as NodeUniquePropertyConstraint;
          return (
            existingNodeUnique.label === changeSet.label &&
            existingNodeUnique.property === changeSet.property
          );
        default:
          return false;
      }
    });
  }

  return false;
};

export default (
  changeSet: ChangeSet,
  existingIndexes: Index[],
  existingConstraints: Constraint[],
  up: boolean
): boolean => {
  let isPresent = isChangeSetSubjectPresent(changeSet, existingIndexes, existingConstraints);

  // cypher is always false
  if (isCypherChangeSet(changeSet)) {
    return false;
  }

  // invert the whole thing if we are migrating down
  // there's probably a fancier boolean algebra way to do this
  if (!up) {
    isPresent = !isPresent;
  }
  // invert again if the operation is to delete
  if (changeSet.operation === ChangeSetOperationType.Delete) {
    isPresent = !isPresent;
  }

  return isPresent;
};
