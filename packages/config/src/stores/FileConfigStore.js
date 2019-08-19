const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

class FileConfigStore {
  constructor({
    configProcessor,
    path,
    format,
  } = {}) {
    this.path = path;
    this.format = format;
    this.configProcessor = configProcessor;
  }

  async getConfig() {
    return this.configProcessor.process(
      this.format,
      await this.loadFile(this.path),
    );
  }

  async loadFile(path) {
    try {
      return await readFile(path);
    } catch (e) {
      throw new Error(`Can't load config from file: ${e.message}`);
    }
  }
}

module.exports = {
  FileConfigStore,
};
