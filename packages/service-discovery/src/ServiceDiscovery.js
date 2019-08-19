const _ = require('lodash');
const { RedisBackend } = require('./backends/RedisBackend');
const { ServiceReference } = require('./ServiceReference');
const HeartbeatManager = require('./HeartbeatManager');
const ServiceRecord = require('./ServiceRecord');

class ServiceDiscovery {
  constructor({
    name,
    backend = new RedisBackend({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    }),
    heartbeatInterval = 30,
  } = {}) {
    this.name = name;
    this.backend = backend;
    this.heartbeatManager = new HeartbeatManager(
      recordId => this.backend.expiresIn(recordId, 60),
      heartbeatInterval * 1000,
    );
  }

  /**
   * @param {object} opts
   * @param {string} opts.name
   * @param {string} opts.type
   * @param {object} opts.metadata
   * @param {object} opts.location
   * @returns {ServiceRecord}
   */
  async publish({
    name,
    type,
    metadata = {},
    location = {},
  }) {
    const record = new ServiceRecord({
      name,
      type,
      metadata,
      location,
    });

    await this.backend.create(record.id, record);
    this.heartbeatManager.start(record.id);

    return record;
  }

  /**
   * @param {object} record
   */
  async unpublish(record) {
    this.heartbeatManager.stop(record.id);
    await this.backend.delete(record.id);
  }

  /**
   * @param {object} opts
   * @param {string} opts.name
   * @param {string} opts.type
   */
  async lookup({ name, type, ...criteria }) {
    const reference = {
      name,
      type,
      ...criteria,
    };

    const instances = _.filter(
      await this.backend.list(),
      record => ServiceRecord.match(record, reference),
    );

    return new ServiceReference(reference, instances);
  }

  /**
   * @returns {Promise<void>}
   */
  async close() {
    this.heartbeatManager.stopEverything();
    await this.backend.close();
  }
}

module.exports = { ServiceDiscovery };
