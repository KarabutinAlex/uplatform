const redis = require('redis');

class RedisBackend {
  /**
   * @param {string} url
   * @param {object} options
   * @param {string} prefix
   * @param {number} ttl
   */
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

  /**
   * Returns a Promise for a RedisClient.
   *
   * @returns {Promise<redis.RedisClient>}
   */
  get client() {
    if (this.redisClient == null) {
      this.redisClient = this.connect();
    }

    return this.redisClient;
  }

  /**
   * Connects to a Redis server.
   *
   * @async
   * @private
   */
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

  /**
   * @private
   */
  async cleanup() {
    const keys = await this.search();
    if (keys.length) {
      await this.bulkRemove(...keys);
    }
  }

  /**
   * @param {string} id
   * @param {object} instance
   * @returns {Promise<void>}
   */
  async create(id, instance) {
    await this.update(`${this.prefix}:${id}`, instance);
  }

  /**
   * Deletes a service record.
   *
   * @param {string} recordId Record ID
   * @returns {Promise<void>}
   */
  async delete(recordId) {
    return this.bulkRemove(`${this.prefix}:${recordId}`);
  }

  /**
   * Returns a list of registered services.
   *
   * @returns {Promise<object[]>}
   */
  async list() {
    const keys = await this.search();
    return keys.length
      ? this.bulkRead(keys)
      : [];
  }

  async expiresIn(recordId, seconds) {
    const client = await this.client;

    return new Promise((resolve, reject) => {
      client.expire(
        `${this.prefix}:${recordId}`,
        seconds,
        (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        },
      );
    });
  }

  /**
   * Closes a connection to a Redis server.
   */
  async close() {
    if (this.isConnected) {
      const client = await this.client;
      await client.quit();
    }
  }

  /**
   * Stores an value to Redis.
   *
   * @private
   * @param {string} key
   * @param {*} value
   */
  async update(key, value) {
    const client = await this.client;

    return new Promise((resolve, reject) => client.set(
      key,
      JSON.stringify(value),
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

  /**
   * @private
   * @param {string[]} keys
   * @return {Promise<object[]>}
   */
  async bulkRead(keys) {
    const client = await this.client;

    if (!keys.length) return [];

    return new Promise((resolve, reject) => {
      client.mget(keys, (error, items) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(items.map(JSON.parse));
      });
    });
  }

  /**
   * @private
   * @param {...string} keys
   * @returns {Promise<void>}
   */
  async bulkRemove(...keys) {
    const client = await this.client;
    return new Promise((resolve, reject) => {
      client.del(...keys, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  /**
   * @private
   * @param {string} query
   * @returns {Promise<string[]>}
   */
  async search(query = '*') {
    const client = await this.client;

    return new Promise((resolve, reject) => client.keys(
      `${this.prefix}:${query}`,
      (error, keys) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(keys);
      },
    ));
  }
}

module.exports = { RedisBackend };
