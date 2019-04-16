import { v1 as neo4j } from 'neo4j-driver';

export const getStoredVersion = async (session: neo4j.Session): Promise<number | null> => {
  return session.readTransaction(async tx => {
    try {
      const result = await tx.run(`MATCH (store:Neo4jMigrateStorage) RETURN store { .version }`);
      if (!result.records[0]) {
        return null;
      }
      const store = result.records[0].get('store');
      if (store && store.version !== undefined && store.version !== null) {
        console.info(`Found current version bookmark: ${store.version}`);
        return store.version;
      } else {
        console.warn(`Found migration storage in database, but no version`, store);
        return null;
      }
    } catch (err) {
      console.info(
        `Could not retrieve current database version. Proceeding without version bookmark.`,
        err,
      );
      return null;
    }
  });
};

export const setStoredVersion = async (session: neo4j.Session, version: number): Promise<void> => {
  await session.writeTransaction(async tx => {
    try {
      await tx.run(`MERGE (store:Neo4jMigrateStorage) SET store.version = $version RETURN store`, {
        version,
      });
      console.info(`Stored current version bookmark in database. (version: ${version})`);
    } catch (err) {
      console.info(
        `Could not store database version. Proceeding without bookmarking version.`,
        err,
      );
    }
  });
};
