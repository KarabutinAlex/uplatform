const redis = require('redis');

class RedisBackend {
  constructor({
    url,
    options = {},
    prefix = 'service-discovery',
    ttl = 60,
  } = {}) {
    this.prefix = prefix;
    this.url = url;
    this.options = options;
    this.redisClient = null;
    this.isConnected = false;
    this.ttl = ttl;
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

      redisClient.once('error', (error) => {
        reject(
          new Error(`Can't connect to Redis backend: ${error.messsage}`),
        );
      });
    });
  }

  async cleanup() {
    const client = await this.client;

    return new Promise((resolve, reject) => client.keys(
      `${this.prefix}:*`,
      (error, keys) => {
        if (error) return reject(error);
        if (!keys.length) return resolve();

        return client.del(...keys, (err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
      },
    ));
  }

  async create(id, instance) {
    const client = await this.client;

    return new Promise((resolve, reject) => client.set(
      `${this.prefix}:${id}`,
      JSON.stringify(instance),
      'EX', this.ttl,
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      },
    ));
  }

  async delete(id) {
    const client = await this.client;

    return new Promise((resolve, reject) => client.del(
      `${this.prefix}:${id}`,
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      },
    ));
  }

  async list() {
    const client = await this.client;

    return new Promise((resolve, reject) => client.keys(
      `${this.prefix}:*`,
      (error, keys) => {
        if (error) return reject(error);
        if (!keys.length) return resolve([]);

        return client.mget(keys, (err, items) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(items.map(JSON.parse));
        });
      },
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
