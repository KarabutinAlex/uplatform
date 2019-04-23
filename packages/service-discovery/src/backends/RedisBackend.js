const redis = require('redis');
const _ = require('lodash');

class RedisBackend {

    constructor(
        url,
        options = {},
        key = 'service-discovery',
    ) {
        this.key = key;
        this.url = url;
        this.options = options;
        this.redisClient = null;
        this.isConnected = false;
    }

    get client() {
        if (this.redisClient == null) {
            this.redisClient = this.connect();
        }

        return this.redisClient;
    }

    connect() {
        return new Promise((resolve, reject) => {
            const redisClient = redis.createClient(this.url, this.options);

            redisClient.on('ready', () => {
                this.isConnected = true;
                resolve(redisClient);
            });

            redisClient.once('error', error => {
                reject(
                    new Error(`Can't connect to Redis backend: ${error.messsage}`),
                );
            });
        });
    }

    async create(id, instance) {
        const client = await this.client;

        return new Promise((resolve, reject) => client.hset(
            this.key,
            id,
            JSON.stringify(instance),
            error => {
                if (error) {
                    return reject(error);
                }

                resolve();
            }
        ));
    }

    async delete(id) {
        const client = await this.client;

        return new Promise((resolve, reject) => client.hdel(
            this.key,
            id,
            error => {
                if (error) {
                    return reject(error);
                }

                resolve();
            },
        ));
    }

    async list() {
        const client = await this.client;

        return new Promise((resolve, reject) => client.hgetall(
            this.key,
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(
                    _.map(
                        _.values(result),
                        JSON.parse,
                    ),
                );
            }
        ));
    }

    async close() {
        if (this.isConnected) {
            const client = await this.client;
            await client.quit();
        }
    }
}

module.exports = {
    RedisBackend,
};
