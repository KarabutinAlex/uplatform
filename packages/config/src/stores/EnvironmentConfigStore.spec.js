const { assert } = require('chai');
const { EnvironmentConfigStore } = require('./EnvironmentConfigStore');

describe('EnvironmentConfigStore', () => {
  it('loads config from environment variables', async () => {
    process.env.DATABASE_URL = 'postgres://localhost/db2';

    const configStore = new EnvironmentConfigStore({
      keys: {
        DATABASE_URL: 'database.url',
      },
    });

    const config = await configStore.getConfig();

    assert.equal(config.database.url, 'postgres://localhost/db2');
  });
});
