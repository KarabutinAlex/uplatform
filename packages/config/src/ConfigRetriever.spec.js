const { assert } = require('chai');
const { ConfigRetriever } = require('./ConfigRetriever');
const { createHttpServer } = require('./utils/http-server');

describe('ConfigRetriever', () => {
  let httpServer = null;

  afterEach(() => {
    if (httpServer != null) {
      httpServer.close();
      httpServer = null;
    }
  });

  it('loads config from environment variables', async () => {
    process.env.DATABASE_URL = 'postgres://localhost/db2';

    const configRetriever = new ConfigRetriever({
      stores: [
        {
          type: 'env',
          keys: {
            DATABASE_URL: 'database.url',
          },
        },
      ],
    });

    const config = await configRetriever.getConfig();

    assert.equal(config.database.url, 'postgres://localhost/db2');
  });

  it('loads config from an http endpoint', async () => {
    httpServer = await createHttpServer((request, response) => {
      response.setHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({
          database: {
            url: 'postgres://localhost/db_from_http_json',
          },
        }),
      );
    });

    const { port } = httpServer.address();

    const configRetriever = new ConfigRetriever({
      stores: [
        {
          type: 'http',
          url: `http://127.0.0.1:${port}/config`,
        },
      ],
    });

    const config = await configRetriever.getConfig();

    assert.equal(config.database.url, 'postgres://localhost/db_from_http_json');
  });

  it('loads config from a file', async () => {
    const configRetriever = new ConfigRetriever({
      stores: [
        {
          type: 'file',
          format: 'yaml',
          path: `${__dirname}/../config/config.yaml`,
        },
      ],
    });

    const config = await configRetriever.getConfig();

    assert.equal(config.database.url, 'postgres://127.0.0.1:5432/db1');
  });

  it('throws an error when passed a store with unknown type', () => {
    assert.throw(
      () => new ConfigRetriever({
        stores: [
          { type: 'unknown-store-type' },
        ],
      }),
      'Specified an unknown config store (type "unknown-store-type").',
    );
  });

  it('throws an error when a required store fails', async () => {
    const configRetriever = new ConfigRetriever({
      stores: [
        {
          type: 'file',
          format: 'yaml',
          path: `${__dirname}/../config/config-that-not-found.yml`,
        },
      ],
    });

    let error = null;
    try {
      await configRetriever.getConfig();
    } catch (e) {
      error = e;
    }

    assert.instanceOf(error, Error);
  });

  it('skips stores which is failed', async () => {
    const configRetriever = new ConfigRetriever({
      stores: [
        {
          type: 'file',
          format: 'yaml',
          path: `${__dirname}/../examples/config-that-not-found.yml`,
          optional: true,
        },
      ],
    });

    let error = null;
    try {
      await configRetriever.getConfig();
    } catch (e) {
      error = e;
    }

    assert.isNull(error);
  });

  it('overrides data by order of stores', async () => {
    process.env.DATABASE_URL = 'postgres://127.0.0.1:5432/db2';

    const configRetriever = new ConfigRetriever({
      stores: [
        {
          type: 'file',
          format: 'yaml',
          path: `${__dirname}/../config/config.yaml`,
        },
        {
          type: 'env',
          keys: {
            DATABASE_URL: 'database.url',
          },
        },
      ],
    });

    const config = await configRetriever.getConfig();

    assert.equal(config.database.url, 'postgres://127.0.0.1:5432/db2');
  });
});
