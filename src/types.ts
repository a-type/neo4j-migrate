export enum Neo4jIndexOrConstraintType {
  NodeLabelProperty = 'node_label_property',
  NodeUniqueProperty = 'node_unique_property',
  // RelationshipTypeProperty = 'relationship_type_property',
  NodeFulltext = 'node_fulltext',
  RelationshipFulltext = 'relationship_fulltext'
}

export type NodeLabelPropertyIndex = {
  type: Neo4jIndexOrConstraintType.NodeLabelProperty;
  label: string;
  properties: string[];
};

// export type RelationshipTypePropertyIndex = {
//   type: Neo4jIndexType.RelationshipTypeProperty;
//   relationshipType: string;
//   properties: string[];
// };

export type NodeFulltextIndex = {
  type: Neo4jIndexOrConstraintType.NodeFulltext;
  name: string;
  labels: string[];
  properties: string[];
};

export type RelationshipFulltextIndex = {
  type: Neo4jIndexOrConstraintType.RelationshipFulltext;
  name: string;
  realtionshipTypes: string[];
  properties: string[];
};

export type Index =
  | NodeLabelPropertyIndex
  // | RelationshipTypePropertyIndex
  | NodeFulltextIndex
  | RelationshipFulltextIndex;

export type NodeUniquePropertyConstraint = {
  type: Neo4jIndexOrConstraintType.NodeUniqueProperty;
  label: string;
  property: string;
};

export type Constraint = NodeUniquePropertyConstraint;

export enum ChangeSetOperationType {
  Apply = 'APPLY',
  Remove = 'REMOVE'
}

export enum ChangeSetKind {
  Index,
  Constraint,
  Cypher
}

export type IndexChangeSet = {
  kind: ChangeSetKind.Index;
  operation: ChangeSetOperationType;
  index: Index;
};

export type ConstraintChangeSet = {
  kind: ChangeSetKind.Constraint;
  operation: ChangeSetOperationType;
  constraint: Constraint;
};

export type CypherChangeSet = {
  kind: ChangeSetKind.Cypher;
  operation: ChangeSetOperationType.Apply;
  up: string;
  down: string;
};

export type ChangeSet = IndexChangeSet | ConstraintChangeSet | CypherChangeSet;
