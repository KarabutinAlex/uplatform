const _ = require('lodash');
const uuidv4 = require('uuid/v4');

class ServiceRecord {
  /**
   * @param {object} opts
   * @param {string} opts.id
   * @param {string} opts.name
   * @param {string} opts.type
   * @param {object} opts.metadata
   * @param {object} opts.location
   */
  constructor({
    id = uuidv4(),
    name,
    type,
    metadata,
    location,
  }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.metadata = metadata;
    this.location = location;
  }

  static match(record, { name, type = '*', ...metadata }) {
    if (name !== record.name) {
      return false;
    }

    if (type !== '*' && type !== record.type) {
      return false;
    }

    return _.isMatch(record.metadata, metadata);
  }
}

module.exports = ServiceRecord;
