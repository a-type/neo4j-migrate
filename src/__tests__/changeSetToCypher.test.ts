import * as changeSetToCypher from '../changeSetToCypher';
import { ChangeSetKind, Neo4jIndexOrConstraintType, ChangeSetOperationType } from '../types';

describe('changeSetToCypher', () => {
  describe('a cypher changeset', () => {
    it('converts up', () => {
      expect(
        changeSetToCypher.up({
          kind: ChangeSetKind.Cypher,
          up: 'MATCH (p:Person) SET p.name = "Foo"',
          down: null,
        }),
      ).toEqual('MATCH (p:Person) SET p.name = "Foo"');
    });
    it('converts down', () => {
      expect(
        changeSetToCypher.down({
          kind: ChangeSetKind.Cypher,
          up: 'MATCH (p:Person) SET p.name = "Foo"',
          down: 'MATCH (p:Person) SET p.name = "Bar"',
        }),
      ).toEqual('MATCH (p:Person) SET p.name = "Bar"');
    });
  });

  describe('an index changeset', () => {
    describe('node property index', () => {
      describe('creating', () => {
        it('converts up', () => {
          expect(
            changeSetToCypher.up({
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeLabelProperty,
              label: 'Person',
              properties: ['id'],
            }),
          ).toEqual('CREATE INDEX ON :Person(id)');
        });

        it('converts down', () => {
          expect(
            changeSetToCypher.down({
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeLabelProperty,
              label: 'Person',
              properties: ['id'],
            }),
          ).toEqual('DROP INDEX ON :Person(id)');
        });
      });

      describe('deleting', () => {
        it('converts up', () => {
          expect(
            changeSetToCypher.up({
              operation: ChangeSetOperationType.Delete,
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeLabelProperty,
              label: 'Person',
              properties: ['id'],
            }),
          ).toEqual('DROP INDEX ON :Person(id)');
        });

        it('converts down', () => {
          expect(
            changeSetToCypher.down({
              operation: ChangeSetOperationType.Delete,
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeLabelProperty,
              label: 'Person',
              properties: ['id'],
            }),
          ).toEqual('CREATE INDEX ON :Person(id)');
        });
      });
    });

    describe('node composite index', () => {
      describe('creating', () => {
        it('converts up', () => {
          expect(
            changeSetToCypher.up({
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeLabelProperty,
              label: 'Person',
              properties: ['id', 'name'],
            }),
          ).toEqual('CREATE INDEX ON :Person(id,name)');
        });

        it('converts down', () => {
          expect(
            changeSetToCypher.down({
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeLabelProperty,
              label: 'Person',
              properties: ['id', 'name'],
            }),
          ).toEqual('DROP INDEX ON :Person(id,name)');
        });
      });

      describe('deleting', () => {
        it('converts up', () => {
          expect(
            changeSetToCypher.up({
              operation: ChangeSetOperationType.Delete,
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeLabelProperty,
              label: 'Person',
              properties: ['id', 'name'],
            }),
          ).toEqual('DROP INDEX ON :Person(id,name)');
        });

        it('converts down', () => {
          expect(
            changeSetToCypher.down({
              operation: ChangeSetOperationType.Delete,
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeLabelProperty,
              label: 'Person',
              properties: ['id', 'name'],
            }),
          ).toEqual('CREATE INDEX ON :Person(id,name)');
        });
      });
    });

    describe('node fulltext index', () => {
      describe('creating', () => {
        it('converts up', () => {
          expect(
            changeSetToCypher.up({
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeFulltext,
              name: 'fulltext',
              labels: ['Person'],
              properties: ['name', 'bio'],
            }),
          ).toEqual('CALL db.index.fulltext.createNodeIndex("fulltext",["Person"],["name","bio"])');
        });

        it('converts down', () => {
          expect(
            changeSetToCypher.down({
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeFulltext,
              name: 'fulltext',
              labels: ['Person'],
              properties: ['name', 'bio'],
            }),
          ).toEqual('CALL db.index.fulltext.deleteNodeIndex("fulltext")');
        });
      });

      describe('deleting', () => {
        it('converts up', () => {
          expect(
            changeSetToCypher.up({
              operation: ChangeSetOperationType.Delete,
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeFulltext,
              name: 'fulltext',
              labels: ['Person'],
              properties: ['name', 'bio'],
            }),
          ).toEqual('CALL db.index.fulltext.deleteNodeIndex("fulltext")');
        });

        it('converts down', () => {
          expect(
            changeSetToCypher.down({
              operation: ChangeSetOperationType.Delete,
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.NodeFulltext,
              name: 'fulltext',
              labels: ['Person'],
              properties: ['name', 'bio'],
            }),
          ).toEqual('CALL db.index.fulltext.createNodeIndex("fulltext",["Person"],["name","bio"])');
        });
      });
    });

    describe('relationship fulltext index', () => {
      describe('creating', () => {
        it('converts up', () => {
          expect(
            changeSetToCypher.up({
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.RelationshipFulltext,
              name: 'fulltext',
              relationshipTypes: ['FRIENDS_WITH'],
              properties: ['level', 'quality'],
            }),
          ).toEqual(
            'CALL db.index.fulltext.createRelationshipIndex("fulltext",["FRIENDS_WITH"],["level","quality"])',
          );
        });

        it('converts down', () => {
          expect(
            changeSetToCypher.down({
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.RelationshipFulltext,
              name: 'fulltext',
              relationshipTypes: ['FRIENDS_WITH'],
              properties: ['level', 'quality'],
            }),
          ).toEqual('CALL db.index.fulltext.deleteRelationshipIndex("fulltext")');
        });
      });

      describe('deleting', () => {
        it('converts up', () => {
          expect(
            changeSetToCypher.up({
              operation: ChangeSetOperationType.Delete,
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.RelationshipFulltext,
              name: 'fulltext',
              relationshipTypes: ['FRIENDS_WITH'],
              properties: ['level', 'quality'],
            }),
          ).toEqual('CALL db.index.fulltext.deleteRelationshipIndex("fulltext")');
        });

        it('converts down', () => {
          expect(
            changeSetToCypher.down({
              operation: ChangeSetOperationType.Delete,
              kind: ChangeSetKind.Index,
              type: Neo4jIndexOrConstraintType.RelationshipFulltext,
              name: 'fulltext',
              relationshipTypes: ['FRIENDS_WITH'],
              properties: ['level', 'quality'],
            }),
          ).toEqual(
            'CALL db.index.fulltext.createRelationshipIndex("fulltext",["FRIENDS_WITH"],["level","quality"])',
          );
        });
      });
    });
  });

  describe('a constraint changeset', () => {
    describe('unique constraint', () => {
      describe('creating', () => {
        it('converts up', () => {
          expect(
            changeSetToCypher.up({
              kind: ChangeSetKind.Constraint,
              type: Neo4jIndexOrConstraintType.NodeUniqueProperty,
              label: 'Person',
              property: 'id',
            }),
          ).toEqual('CREATE CONSTRAINT ON (n:Person) ASSERT n.id IS UNIQUE');
        });

        it('converts down', () => {
          expect(
            changeSetToCypher.down({
              kind: ChangeSetKind.Constraint,
              type: Neo4jIndexOrConstraintType.NodeUniqueProperty,
              label: 'Person',
              property: 'id',
            }),
          ).toEqual('DROP CONSTRAINT ON (n:Person) ASSERT n.id IS UNIQUE');
        });
      });

      describe('deleting', () => {
        it('converts up', () => {
          expect(
            changeSetToCypher.up({
              operation: ChangeSetOperationType.Delete,
              kind: ChangeSetKind.Constraint,
              type: Neo4jIndexOrConstraintType.NodeUniqueProperty,
              label: 'Person',
              property: 'id',
            }),
          ).toEqual('DROP CONSTRAINT ON (n:Person) ASSERT n.id IS UNIQUE');
        });

        it('converts down', () => {
          expect(
            changeSetToCypher.down({
              operation: ChangeSetOperationType.Delete,
              kind: ChangeSetKind.Constraint,
              type: Neo4jIndexOrConstraintType.NodeUniqueProperty,
              label: 'Person',
              property: 'id',
            }),
          ).toEqual('CREATE CONSTRAINT ON (n:Person) ASSERT n.id IS UNIQUE');
        });
      });
    });
  });
});
