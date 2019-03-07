import { v1 as neo4j } from 'neo4j-driver';
import { Neo4jIndexOrConstraintType, NodeUniquePropertyConstraint, Constraint } from './types';

const extractNodeUniquePropertyConstraint = (
  record: neo4j.Record
): NodeUniquePropertyConstraint | null => {
  const match = /^CONSTRAINT\s+ON\s+\(\s*\w+:(\w+)\s*\)\s+ASSERT\s+\w+\.(\w+)\s+IS\s+UNIQUE$/;
  const result = match.exec(record.get('description'));

  if (!result) {
    return null;
  }

  const label = result[1];
  const property = result[2];

  return {
    type: Neo4jIndexOrConstraintType.NodeUniqueProperty,
    label,
    property
  };
};

const determineConstraintType = (description: string) => {
  if (description.endsWith('IS UNIQUE')) {
    return Neo4jIndexOrConstraintType.NodeUniqueProperty;
  }
  return null;
};

const reshapeConstraint = (record: neo4j.Record): Constraint | null => {
  const type = determineConstraintType(record.get('description'));

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
