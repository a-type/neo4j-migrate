import { v1 as neo4j } from 'neo4j-driver';

const VERSION_KEY = 'neo4j_migrate_current_version';

export const getStoredVersion = async (session: neo4j.Session): Promise<number | null> => {
  try {
    return session.readTransaction(async tx => {
      const result = await tx.run(`CALL apoc.static.get("${VERSION_KEY}")`);
      const stringVer = result.records[0].get('value') as string;
      const intVer = parseInt(stringVer, 10);
      if (isNaN(intVer)) {
        return null;
      }
      return intVer;
    });
  } catch (err) {
    console.info(
      `Could not use APOC to retrieve static value for database version. Proceeding without version bookmark.`,
    );
    return null;
  }
};

export const setStoredVersion = async (session: neo4j.Session, version: number): Promise<void> => {
  try {
    await session.writeTransaction(async tx => {
      await tx.run(`CALL apoc.static.set("${VERSION_KEY}", $version)`, { version });
    });
    console.info(`Stored current version bookmark in database static value "${VERSION_KEY}".`);
  } catch (err) {
    console.info(
      `Could not use APOC to store static value for database version. Proceeding without bookmarking version.`,
    );
  }
};
