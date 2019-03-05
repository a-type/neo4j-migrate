import { v1 as neo4j } from 'neo4j-driver';
import { ChangeSet } from './types';
import { up as convertUp, down as convertDown } from './changeSetToCypher';

export const createApplyFunction = (converter: (changeSet: ChangeSet) => string) => (
  changeSets: ChangeSet[],
  session: neo4j.Session
) =>
  session.writeTransaction(async tx => {
    const cyphers = changeSets.map(converter);

    return cyphers.reduce<Promise<any>>(async (lastTransaction, cypher) => {
      await lastTransaction;
      return tx.run(cypher);
    }, Promise.resolve());
  });

export const up = createApplyFunction(convertUp);
export const down = createApplyFunction(convertDown);
