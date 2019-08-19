const _ = require('lodash');
const { ConfigProcessor } = require('./ConfigProcessor');
const { EnvironmentConfigStore } = require('./stores/EnvironmentConfigStore');
const { FileConfigStore } = require('./stores/FileConfigStore');
const { HttpConfigStore } = require('./stores/HttpConfigStore');

class UnknownConfigStore extends Error {
  constructor(type) {
    super(`Specified an unknown config store (type "${type}").`);
    this.name = 'UnknownConfigStore';
  }
}

class ConfigRetriever {
  constructor({
    stores = [],
    configProcessor = new ConfigProcessor(),
  } = {}) {
    this.sources = [];
    this.configProcessor = configProcessor;
    this.connectStores(stores);
  }

  connectStores(stores) {
    const storeFactories = {
      env: options => new EnvironmentConfigStore(options),
      file: options => new FileConfigStore(options),
      http: options => new HttpConfigStore(options),
    };

    this.sources.push(
      ...stores.map(({ type, optional, ...options }) => {
        if (!storeFactories[type]) {
          throw new UnknownConfigStore(type);
        }

        return {
          optional,
          store: storeFactories[type]({
            configProcessor: this.configProcessor,
            ...options,
          }),
        };
      }),
    );
  }

  async getConfig() {
    const configChunks = await Promise.all(
      this.sources.map(source => source.store.getConfig()
        .catch((error) => {
          if (source.optional) return {};
          throw error;
        })),
    );

    return _.merge({}, ...configChunks);
  }
}

module.exports = {
  ConfigRetriever,
  UnknownConfigStore,
};
