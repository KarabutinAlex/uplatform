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
        heartbeatInterval = 1000,
    } = {}) {
        this.name = name;
        this.backend = backend;
        this.heartbeatInterval = heartbeatInterval;
        this.heartbeats = new Map();
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

        const heartbeatId = setInterval(
            async () => {
                try {
                    await this.backend.create(instance.id, instance);
                } catch (error) {
                    console.error(`Cant publish service "${instance.id}:`, error.message);
                    clearInterval(heartbeatId);
                    this.heartbeats.delete(instance.id);
                }
            },
            this.heartbeatInterval,
        );

        this.heartbeats.set(instance.id, heartbeatId);

        return instance;
    }

    async unpublish({ id }) {
        clearInterval(this.heartbeats.get(id));
        this.heartbeats.delete(id);

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
        for (const heartbeatId of this.heartbeats.values()) {
            clearInterval(heartbeatId);
        }

        this.heartbeats.clear();

        await this.backend.close();
    }
}

module.exports = {
    ServiceDiscovery,
};
