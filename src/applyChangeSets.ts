import { v1 as neo4j } from 'neo4j-driver';
import { ChangeSet, Migration, Constraint, Index } from './types';
import { up as convertUp, down as convertDown } from './changeSetToCypher';
import { isIndexChangeSet, isConstraintChangeSet } from './guards';
import readIndexes from './readIndexes';
import readConstraints from './readConstraints';
import isChangeSetFulfilled from './isChangeSetFulfilled';

type ConverterFunction = (changeSet: ChangeSet) => string;

export const createApplyFunction = (converter: ConverterFunction) => async (
  changeSets: ChangeSet[],
  session: neo4j.Session
) => {
  let indexes: Index[] = [];
  let constraints: Constraint[] = [];

  if (changeSets.some(isIndexChangeSet)) {
    indexes = await readIndexes(session);
  }
  if (changeSets.some(isConstraintChangeSet)) {
    constraints = await readConstraints(session);
  }

  await session.writeTransaction(async tx => {
    const changeSetsWithCypher: { changeSet: ChangeSet; cypher: string }[] = changeSets
      .map(converter)
      .map((cypher, index) => ({ cypher, changeSet: changeSets[index] }));

    return changeSetsWithCypher.reduce<Promise<any>>(
      async (lastTransaction, { changeSet, cypher }) => {
        await lastTransaction;

        // double-check if we actually need to run the change set
        const isFulfilled = isChangeSetFulfilled(changeSet, indexes, constraints);

        if (isFulfilled) {
          console.info(`Skipping ${cypher}; already fulfilled in existing schema`);
          return;
        }

        return tx.run(cypher);
      },
      Promise.resolve()
    );
  });
};

export const up = createApplyFunction(convertUp);
export const down = createApplyFunction(convertDown);
