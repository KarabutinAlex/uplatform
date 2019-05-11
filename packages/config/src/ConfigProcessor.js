class ConfigProcessor {
    constructor({
        yamlModuleId = 'js-yaml',
    } = {}) {
        this.yamlModuleId = yamlModuleId;
    }

    process(format, data) {
        switch (format) {
        default:
        case 'json':
            return ConfigProcessor.parseJsonData(data);

        case 'yaml':
            return this.parseYamlData(data);
        }
    }

    static parseJsonData(data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            throw new Error(`Can't process JSON content: ${e.message}.`);
        }
    }

    parseYamlData(data) {
        try {
            return this.yaml.safeLoad(data);
        } catch (e) {
            throw new Error(`Can't process YAML content: ${e.message}.`);
        }
    }

    get yaml() {
        if (this.yamlModule) {
            return this.yamlModule;
        }

        try {
            this.yamlModule = require(this.yamlModuleId);
            return this.yamlModule;
        } catch (e) {
            throw new Error(`Module "${this.yamlModuleId}" is not installed.`);
        }
    }
}

module.exports = {
    ConfigProcessor,
};
