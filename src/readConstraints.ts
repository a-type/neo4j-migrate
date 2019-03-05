import { v1 as neo4j } from 'neo4j-driver';
import { Neo4jIndexOrConstraintType, NodeUniquePropertyConstraint, Constraint } from './types';

const extractNodeUniquePropertyConstraint = (
  record: neo4j.Record
): NodeUniquePropertyConstraint => ({
  type: Neo4jIndexOrConstraintType.NodeUniqueProperty,
  label: record.get('tokenNames')[0],
  property: record.get('properties')[0]
});

const reshapeConstraint = (record: neo4j.Record): Constraint | null => {
  const type = record.get('type') as Neo4jIndexOrConstraintType;

  switch (type) {
    case Neo4jIndexOrConstraintType.NodeUniqueProperty:
      return extractNodeUniquePropertyConstraint(record);
    default:
      return null; // unsupported constraint type
  }
};

/**
 * Reads current database indexes and returns them
 * in parsed format
 */
export default (session: neo4j.Session): Promise<Constraint[]> =>
  session.readTransaction<Constraint[]>(async tx => {
    const result = await tx.run(`CALL db.constraints`);

    return result.records
      .map(reshapeConstraint)
      .filter(constraint => constraint !== null) as Constraint[];
  });
