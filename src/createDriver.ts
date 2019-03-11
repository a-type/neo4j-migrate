import { v1 as neo4j } from 'neo4j-driver';

export type DriverParams = {
  host?: string;
  username?: string;
  password?: string;
  config?: neo4j.Config;
};

export default (config: DriverParams = {}) => {
  const environmentConfig = {
    host: process.env.NEO4J_HOST,
    username: process.env.NEO4J_USERNAME,
    password: process.env.NEO4J_PASSWORD,
  };

  const mergedConfig = {
    ...config,
    host: config.host || environmentConfig.host,
    username: config.username || environmentConfig.username,
    password: config.password || environmentConfig.password,
  };

  console.info(
    `Connecting to Neo4j on ${mergedConfig.host} ${
      mergedConfig.password ? 'with credentials' : 'without credentials'
    }`,
  );

  return neo4j.driver(
    mergedConfig.host as string,
    mergedConfig.username && mergedConfig.password
      ? neo4j.auth.basic(mergedConfig.username, mergedConfig.password)
      : undefined,
    mergedConfig.config,
  );
};
