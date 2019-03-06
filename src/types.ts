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
  labels?: string[];
  properties?: string[];
};

export type RelationshipFulltextIndex = {
  type: Neo4jIndexOrConstraintType.RelationshipFulltext;
  name: string;
  relationshipTypes?: string[];
  properties?: string[];
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

export type CypherMigration = {
  up: string;
  down: string;
};

export enum ChangeSetOperationType {
  Create = 'create',
  Delete = 'delete'
}

export enum ChangeSetKind {
  Index,
  Constraint,
  Cypher
}

export type IndexChangeSet = Index & {
  kind: ChangeSetKind.Index;
  operation?: ChangeSetOperationType; // defaults Apply
};

export type ConstraintChangeSet = Constraint & {
  kind: ChangeSetKind.Constraint;
  operation?: ChangeSetOperationType; // defaults Apply
};

export type CypherChangeSet = CypherMigration & {
  kind: ChangeSetKind.Cypher;
};

export type ChangeSet = IndexChangeSet | ConstraintChangeSet | CypherChangeSet;

export type Migration = {
  indexes: IndexChangeSet[];
  constraints: ConstraintChangeSet[];
  cyphers: CypherChangeSet[];
};

export enum MigrationDirection {
  Up,
  Down
}
