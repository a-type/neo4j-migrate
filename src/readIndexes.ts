import { v1 as neo4j } from 'neo4j-driver';
import {
  Neo4jIndexOrConstraintType,
  NodeFulltextIndex,
  Index,
  RelationshipFulltextIndex,
  NodeLabelPropertyIndex
} from './types';

const extractNodeFulltextIndex = (record: neo4j.Record): NodeFulltextIndex => ({
  type: Neo4jIndexOrConstraintType.NodeFulltext,
  name: record.get('name'),
  labels: record.get('tokenNames'),
  properties: record.get('properties')
});

const extractRelationshipFulltextIndex = (record: neo4j.Record): RelationshipFulltextIndex => ({
  type: Neo4jIndexOrConstraintType.RelationshipFulltext,
  name: record.get('name'),
  realtionshipTypes: record.get('tokenNames'),
  properties: record.get('properties')
});

const extractNodeLabelPropertyIndex = (record: neo4j.Record): NodeLabelPropertyIndex => ({
  type: Neo4jIndexOrConstraintType.NodeLabelProperty,
  label: record.get('tokenNames')[0],
  properties: record.get('properties')
});

const reshapeIndex = (record: neo4j.Record): Index | null => {
  const type = record.get('type') as Neo4jIndexOrConstraintType;

  switch (type) {
    case Neo4jIndexOrConstraintType.NodeFulltext:
      return extractNodeFulltextIndex(record);
    case Neo4jIndexOrConstraintType.RelationshipFulltext:
      return extractRelationshipFulltextIndex(record);
    case Neo4jIndexOrConstraintType.NodeLabelProperty:
      return extractNodeLabelPropertyIndex(record);
    default:
      return null; // unsupported index type
  }
};

/**
 * Reads current database indexes and returns them
 * in parsed format
 */
export default (session: neo4j.Session): Promise<Index[]> =>
  session.readTransaction<Index[]>(async tx => {
    const result = await tx.run(`CALL db.indexes`);

    return result.records.map(reshapeIndex).filter(index => index !== null) as Index[];
  });
