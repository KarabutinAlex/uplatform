const { assert } = require('chai');
const { ServiceReference } = require('./ServiceReference');

describe('ServiceReference', () => {
    it('returns count of instances', () => {
        const serviceRef = new ServiceReference({
            name: 'app-1',
            type: '*',
            metadata: {},
            instances: [
                { id: 1, name: 'app-1', type: 'http', location: {}, metadata: {} },
                { id: 2, name: 'app-1', type: 'http', location: {}, metadata: {} },
            ],
        });

        assert.lengthOf(serviceRef, 2);
    });

    it('creates an HTTP client', () => {
        const serviceRef = new ServiceReference({
            name: 'app-1',
            type: '*',
            metadata: {},
            instances: [
                {
                    id: 1,
                    name: 'app-1',
                    type: 'http',
                    location: {
                        host: '10.20.30.40',
                        port: 12345,
                        path: '/api/v2',
                    },
                    metadata: {}
                },
            ],
        });

        const serviceClient = serviceRef.asHttpClient();

        assert.equal(serviceClient.defaults.baseURL, 'http://10.20.30.40:12345/api/v2');
    });

    it('fails on creating an HTTP when there aren\'t any HTTP instances', () => {
        const serviceRef = new ServiceReference({
            name: 'app-1',
            type: '*',
            metadata: {},
            instances: [
                {
                    id: 1,
                    name: 'app-1',
                    type: 'grpc',
                    location: {},
                    metadata: {}
                },
            ],
        });

        assert.throws(
            () => serviceRef.asHttpClient(),
            `There aren't any registered HTTP instances of "app-1".`,
        )
    });

    it('requires axios to be installed to use an HTTP client', () => {
        const serviceRef = new ServiceReference({
            name: 'app-1',
            type: '*',
            metadata: {},
            instances: [],
            axiosModuleId: 'axios-on-steroids'
        });

        assert.throws(
            () => serviceRef.asHttpClient(),
            `In order to use .asHttpClient() do "npm install --save axios-on-steroids".`,
        );
    });
});
