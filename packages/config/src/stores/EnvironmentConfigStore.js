const _ = require('lodash');

class EnvironmentConfigStore {
  constructor({
    keys = {},
  } = {}) {
    this.keys = keys;
  }

  async getConfig() {
    const config = {};

    for (const [from, to] of Object.entries(this.keys)) {
      _.set(config, to, process.env[from]);
    }

    return config;
  }
}

module.exports = {
  EnvironmentConfigStore,
};
