const _ = require('lodash');

class ServiceReference {
    constructor({
        name,
        type,
        metadata,
        instances,
        axiosModuleId = 'axios',
    }) {
        this.name = name;
        this.type = type;
        this.metadata = metadata;
        this.instances = instances;

        this.axiosModuleId = axiosModuleId;
        this.axiosModule = null;
    }

    get length() {
        return this.instances.length;
    }

    getAxios() {
        if (!this.axiosModule) {
            this.axiosModule = require(this.axiosModuleId);
        }

        return this.axiosModule;
    }

    asHttpClient() {
        let axios;
        try {
            axios = this.getAxios(this.axiosModuleId);
        } catch (e) {
            throw new Error(`In order to use .asHttpClient() do "npm install --save ${this.axiosModuleId}".`);
        }

        const instances = _.filter(this.instances, { type: 'http' });

        if (!instances.length) {
            throw new Error(`There aren't any registered HTTP instances of "${this.name}".`);
        }

        const instanceIndex = _.random(instances.length - 1);
        const instance = instances[instanceIndex];
        const { host, port, path } = instance.location;

        return axios.create({ baseURL: `http://${host}:${port}${path}` });
    }
}

module.exports = {
    ServiceReference,
};
