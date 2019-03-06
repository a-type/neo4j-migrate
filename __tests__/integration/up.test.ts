import { initialize } from './neo4j/manage';

describe('the up command', () => {
  let teardown: () => Promise<any>;

  beforeEach(async () => {
    teardown = await initialize();
  });

  afterEach(async () => {
    await teardown();
  });
});
