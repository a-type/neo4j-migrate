import { Docker } from 'node-docker-api';
import { resolve } from 'path';
import { emptyDir } from 'fs-extra';

const docker = new Docker({});

export const initialize = async () => {
  await emptyDir(resolve(__dirname, './mountedVolumes/data'));

  const container = await docker.container.create({
    image: 'neo4j:3.5',
    name: 'neo4j',
    Env: ['NEO4J_AUTH=none'],
    Volumes: {
      '/data': resolve(__dirname, './mountedVolumes/data'),
      '/plugins': resolve(__dirname, './mountedVolumes/plugins')
    }
  });

  await container.start();

  return async () => {
    await container.stop();
    await container.delete();
  };
};
