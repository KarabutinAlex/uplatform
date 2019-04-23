const uuidv4 = require('uuid/v4');
const _ = require('lodash');
const { RedisBackend } = require('./backends/RedisBackend');
const { ServiceReference } = require('./ServiceReference');

class ServiceDiscovery {

    constructor({
        name,
        backend = new RedisBackend({
            url: process.env['REDIS_URL'] || 'redis://127.0.0.1:6379',
        }),
    } = {}) {
        this.name = name;
        this.backend = backend;
    }

    async publish({
        name,
        type,
        metadata = {},
        location = {},
    }) {
        const instance = {
            id: uuidv4(),
            name,
            type,
            metadata,
            location,
        };

        await this.backend.create(instance.id, instance);

        return instance;
    }

    async unpublish({ id }) {
        await this.backend.delete(id);
    }

    async lookup({ name, type = '*', ...metadata }) {
        return new ServiceReference({
            name,
            type,
            metadata,
            instances: _.filter(
                await this.backend.list(),
                instance => {
                    if (name !== instance.name) {
                        return false;
                    }
    
                    if (type !== '*' && type !== instance.type) {
                        return false;
                    }
    
                    return _.isMatch(instance.metadata, metadata);
                },
            ),
        });
    }

    async close() {
        this.backend.close();
    }
}

module.exports = {
    ServiceDiscovery,
};
