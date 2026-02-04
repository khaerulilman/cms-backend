import { beforeAll } from 'vitest';

import { setupTestDatabase } from './setup.js';

const isIntegrationTest = process.env.TEST_TYPE === 'integration';

beforeAll(async () => {
  if (isIntegrationTest) {
    await setupTestDatabase();
  }
});
