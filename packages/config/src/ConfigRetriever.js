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

        for (const { type, optional, ...options } of stores) {
            switch (type) {
                case 'env':
                    this.sources.push({
                        optional,
                        store: new EnvironmentConfigStore(options),
                    });
                    break;

                case 'file':
                    this.sources.push({
                        optional,
                        store: new FileConfigStore({
                            configProcessor: this.configProcessor,
                            ...options,
                        }),
                    });
                    break;

                case 'http':
                    this.sources.push({
                        optional,
                        store: new HttpConfigStore({
                            configProcessor: this.configProcessor,
                            ...options,
                        }),
                    });
                    break;

                default:
                    throw new UnknownConfigStore(type);
            }
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
