import {
  ChangeSet,
  CypherChangeSet,
  ChangeSetKind,
  IndexChangeSet,
  ConstraintChangeSet
} from './types';

export const isCypherChangeSet = (changeSet: ChangeSet): changeSet is CypherChangeSet =>
  changeSet.kind === ChangeSetKind.Cypher;

export const isIndexChangeSet = (changeSet: ChangeSet): changeSet is IndexChangeSet =>
  changeSet.kind === ChangeSetKind.Index;

export const isContraintChangeSet = (changeSet: ChangeSet): changeSet is ConstraintChangeSet =>
  changeSet.kind === ChangeSetKind.Constraint;
