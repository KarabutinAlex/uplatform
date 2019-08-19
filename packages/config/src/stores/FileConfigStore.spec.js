const { assert } = require('chai');
const { ConfigProcessor } = require('../ConfigProcessor');
const { FileConfigStore } = require('./FileConfigStore');

describe('FileConfigStore', () => {
  it('loads config from a JSON file', async () => {
    const fileConfigStore = new FileConfigStore({
      configProcessor: new ConfigProcessor(),
      path: `${__dirname}/../../config/config.json`,
      format: 'json',
    });

    const config = await fileConfigStore.getConfig();
    assert.equal(config.database.url, 'postgres://127.0.0.1:5432/db1');
  });

  it('loads config from a YAML file', async () => {
    const fileConfigStore = new FileConfigStore({
      configProcessor: new ConfigProcessor(),
      path: `${__dirname}/../../config/config.yaml`,
      format: 'yaml',
    });

    const config = await fileConfigStore.getConfig();
    assert.equal(config.database.url, 'postgres://127.0.0.1:5432/db1');
  });

  it('fails when file not found', async () => {
    const fileConfigStore = new FileConfigStore({
      configProcessor: new ConfigProcessor(),
      path: `${__dirname}/../../config/config-that-does-not-exist.json`,
      format: 'json',
    });

    let error = null;
    try {
      await fileConfigStore.getConfig();
    } catch (e) {
      error = e;
    }

    assert.instanceOf(error, Error);
    assert.match(error.message, /Can't load config from file:/);
  });
});
