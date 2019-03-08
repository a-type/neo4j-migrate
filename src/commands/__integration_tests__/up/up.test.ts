import { v1 as neo4j } from 'neo4j-driver';
import { initialize, cleanup } from '../neo4j/manage';
import { handler as up } from '../../up';
import { resolve } from 'path';
import readIndexes from '../../../readIndexes';
import readConstraints from '../../../readConstraints';
import { Neo4jIndexOrConstraintType } from '../../../types';

describe('the up command', async () => {
  const driver = neo4j.driver('bolt://localhost:7687');
  let session: neo4j.Session;

  beforeEach(async done => {
    session = driver.session();
    done();
  });

  afterEach(async done => {
    if (session) {
      await session.close();
    }
    done();
  });

  afterAll(async done => {
    await driver.close();
    await cleanup();
    done();
  });

  test('running full migrations', async () => {
    await initialize();

    await up({
      ['migration-dir']: resolve(__dirname, './migrations'),
      url: 'bolt://localhost:7687',
      username: 'neo4j',
    });

    const indexes = await readIndexes(session);
    const constraints = await readConstraints(session);

    expect(indexes).toEqual([
      {
        type: Neo4jIndexOrConstraintType.NodeLabelProperty,
        label: 'Post',
        properties: ['category'],
      },
      {
        type: Neo4jIndexOrConstraintType.NodeFulltext,
        name: 'fulltext1',
        labels: ['Person'],
        properties: ['bio'],
      },
      {
        type: Neo4jIndexOrConstraintType.NodeFulltext,
        name: 'fulltext2',
        labels: ['Post'],
        properties: ['text', 'title'],
      },
    ]);

    expect(constraints).toEqual([
      {
        type: Neo4jIndexOrConstraintType.NodeUniqueProperty,
        label: 'Person',
        property: 'id',
      },
    ]);
  }, 30000);
});
