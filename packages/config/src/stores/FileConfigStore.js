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
      await this.loadFile(),
    );
  }

  async loadFile() {
    try {
      const content = await readFile(this.path);
      return content;
    } catch (error) {
      throw new Error(`Can't load config from file: ${error.message}`);
    }
  }
}

module.exports = { FileConfigStore };
