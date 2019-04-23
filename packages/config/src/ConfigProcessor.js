class ConfigProcessor {

    constructor({
        yamlModuleId = 'js-yaml',
    } = {}) {
        this.yamlModuleId = yamlModuleId;
    }

    process(format, data) {
        switch (format) {
            case 'json':
                try {
                    return JSON.parse(data);
                } catch (e) {
                    throw new Error(`Can't process JSON content: ${e.message}.`);
                }

            case 'yaml':
                try {
                    return this.yaml.safeLoad(data);
                } catch (e) {
                    throw new Error(`Can't process YAML content: ${e.message}.`);
                }
        }
    }

    get yaml() {
        if (this.yamlModule) {
            return this.yamlModule;
        }

        try {
            return this.yamlModule = require(this.yamlModuleId);
        } catch (e) {
            throw new Error(`Module "${this.yamlModuleId}" is not installed.`);
        }
    }
}

module.exports = {
    ConfigProcessor,
};
