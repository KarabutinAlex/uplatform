const _ = require('lodash');

class EnvironmentConfigStore {
  constructor({
    keys = {},
  } = {}) {
    this.keys = keys;
  }

  async getConfig() {
    return Object
      .keys(this.keys)
      .reduce(
        (config, from) => {
          const to = this.keys[from];
          const value = process.env[from];

          return _.set(config, to, value);
        },
        {},
      );
  }
}

module.exports = {
  EnvironmentConfigStore,
};
