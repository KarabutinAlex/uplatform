const { assert } = require('chai');
const { createHttpServer } = require('../http-server');
const { HttpConfigStore } = require('./HttpConfigStore');
const { ConfigProcessor } = require('../ConfigProcessor');

describe('HttpConfigStore', () => {
  let httpServer = null;

  afterEach(() => {
    if (httpServer != null) {
      httpServer.close();
      httpServer = null;
    }
  });

  it('loads JSON configs', async () => {
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
    const configStore = new HttpConfigStore({
      url: `http://127.0.0.1:${port}/config`,
      configProcessor: new ConfigProcessor(),
    });

    const config = await configStore.getConfig();

    assert.equal(config.database.url, 'postgres://localhost/db_from_http_json');
  });

  it('loads YAML configs', async () => {
    httpServer = await createHttpServer((request, response) => {
      response.setHeader('Content-Type', 'text/yaml');
      response.end(
        `
                database:
                    url: postgres://localhost/db_from_http_yaml
                `,
      );
    });

    const { port } = httpServer.address();
    const configStore = new HttpConfigStore({
      url: `http://127.0.0.1:${port}/config`,
      configProcessor: new ConfigProcessor(),
    });

    const config = await configStore.getConfig();

    assert.equal(config.database.url, 'postgres://localhost/db_from_http_yaml');
  });

  it('fails when passed an invalid url', async () => {
    const configStore = new HttpConfigStore({
      url: 'something-instead-of-url',
    });

    let error = null;
    try {
      await configStore.getConfig();
    } catch (e) {
      error = e;
    }

    assert.instanceOf(error, Error);
    assert.match(error.message, /Can't send a request to "something-instead-of-url":/);
  });

  it('fails when server responds with 4xx/5xx status code', async () => {
    httpServer = await createHttpServer((request, response) => {
      response.statusCode = 503;
      response.setHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({ message: 'Service unavailable.' }),
      );
    });

    const { port } = httpServer.address();
    const configStore = new HttpConfigStore({
      url: `http://127.0.0.1:${port}/config`,
    });

    let error = null;
    try {
      console.log(await configStore.getConfig());
    } catch (e) {
      error = e;
    }

    assert.instanceOf(error, Error);
    assert.equal(error.message, 'Server responded with an error (status code = 503).');
  });

  it('fails when server responds with an unknown data format', async () => {
    httpServer = await createHttpServer((request, response) => {
      response.setHeader('Content-Type', 'unknown/type');
      response.end('some data');
    });

    const { port } = httpServer.address();
    const configStore = new HttpConfigStore({
      url: `http://127.0.0.1:${port}/config`,
    });

    let error = null;
    try {
      console.log(await configStore.getConfig());
    } catch (e) {
      error = e;
    }

    assert.instanceOf(error, Error);
    assert.equal(error.message, 'Server responded with an unknown data format (content type is "unknown/type").');
  });
});
