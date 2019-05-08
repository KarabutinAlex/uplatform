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
            'env': options => new EnvironmentConfigStore(options),
            'file': options => new FileConfigStore(options),
            'http': options => new HttpConfigStore(options),
        };

        for (const { type, optional, ...options } of stores) {
            if (!storeFactories[type]) {
                throw new UnknownConfigStore(type);
            }

            this.sources.push({
                optional,
                store: storeFactories[type]({
                    configProcessor: this.configProcessor,
                    ...options,
                }),
            });
        }
    }

    async getConfig() {
        return _.merge(
            {},
            ...await Promise.all(
                this.sources.map(async ({ store, optional = false }) => {
                    try {
                        return await store.getConfig();
                    } catch (e) {
                        if (!optional) {
                            throw e;
                        }
                    }
                }),
            ),
        );
    }
}

module.exports = {
    ConfigRetriever,
    UnknownConfigStore,
};
