const { assert } = require('chai');
const redis = require('redis');
const { ServiceDiscovery } = require('./ServiceDiscovery');

const redisUrl = process.env['REDIS_URL'] || 'redis://127.0.0.1:6379';

describe('ServiceDiscovery', () => {
    let providerDiscovery = null;
    let consumerDiscovery = null;

    beforeEach(async () => {
        providerDiscovery = new ServiceDiscovery({ name: 'provider-1' });
        consumerDiscovery = new ServiceDiscovery({ name: 'consumer-1' });

        await providerDiscovery.backend.cleanup();
    });

    afterEach(async () => {
        if (consumerDiscovery != null) {
            await consumerDiscovery.close();
            consumerDiscovery = null;
        }

        if (providerDiscovery != null) {
            await providerDiscovery.close();
            providerDiscovery = null;
        }
    });

    it('consumes a published service', async () => {
        const instance = await providerDiscovery.publish({
            name: 'app-1',
            type: 'http',
            location: {
                host: '10.0.0.10',
                port: 8090,
                path: '/api/v1',
            },
            metadata: {
                version: '1.12',
            },
        });

        const app1Ref = await consumerDiscovery.lookup({ name: 'app-1', type: 'http' });

        await providerDiscovery.unpublish(instance);

        assert.lengthOf(app1Ref, 1);
        assert.deepInclude(app1Ref.instances[0], {
            name: 'app-1',
            type: 'http',
            location: {
                host: '10.0.0.10',
                port: 8090,
                path: '/api/v1',
            },
            metadata: {
                version: '1.12',
            },
        });
    });

    it('unpublishes a published service', async () => {
        const instance = await providerDiscovery.publish({
            name: 'app-1',
            type: 'http',
            location: {
                host: '10.0.0.10',
                port: 8090,
                path: '/api/v1',
            },
            metadata: {
                version: '1.12',
            },
        });

        await providerDiscovery.unpublish(instance);

        const app1Ref = await consumerDiscovery.lookup({ name: 'app-1', type: 'http' });

        assert.lengthOf(app1Ref, 0);
    });

    it('lookups a service by name', async () => {
        const instance = await providerDiscovery.publish({
            name: 'app-2',
            type: 'http',
            location: {
                host: '10.0.0.10',
                port: 8090,
                path: '/api/v1',
            },
            metadata: {
                version: '1.12',
            },
        });

        const app1Ref = await consumerDiscovery.lookup({ name: 'app-1' });
        const app2Ref = await consumerDiscovery.lookup({ name: 'app-2' });

        await providerDiscovery.unpublish(instance);

        assert.lengthOf(app1Ref, 0);
        assert.lengthOf(app2Ref, 1);
    });

    it('lookups a service by type', async () => {
        const app1Http = await providerDiscovery.publish({
            name: 'app-1',
            type: 'http',
            location: {
                host: '10.0.0.10',
                port: 8090,
                path: '/api/v1',
            },
            metadata: {
                version: '1.12',
            },
        });

        const app1Pg = await providerDiscovery.publish({
            name: 'app-1',
            type: 'postgres',
            location: {
                host: '10.0.0.10',
                port: 5432,
                db: 'app1',
            },
        });

        const app1AllRef = await consumerDiscovery.lookup({ name: 'app-1' });
        const app1PgRef = await consumerDiscovery.lookup({ name: 'app-1', type: 'postgres' });

        await providerDiscovery.unpublish(app1Http);
        await providerDiscovery.unpublish(app1Pg);

        assert.lengthOf(app1AllRef, 2);
        assert.lengthOf(app1PgRef, 1);
    });

    it('lookups a service by metadata', async () => {
        const app1V1 = await providerDiscovery.publish({
            name: 'app-1',
            type: 'http',
            location: {
                host: '10.0.0.10',
                port: 8090,
                path: '/api/v1',
            },
            metadata: {
                version: '1.1',
            },
        });

        const app1V2 = await providerDiscovery.publish({
            name: 'app-1',
            type: 'http',
            location: {
                host: '10.0.0.20',
                port: 8090,
                path: '/api/v1',
            },
            metadata: {
                version: '1.2',
            },
        });

        const app1Ref = await consumerDiscovery.lookup({ name: 'app-1' });
        const app1V1Ref = await consumerDiscovery.lookup({ name: 'app-1', version: '1.1' });
        const app1V2Ref = await consumerDiscovery.lookup({ name: 'app-1', version: '1.2' });
        const app1V3Ref = await consumerDiscovery.lookup({ name: 'app-1', version: '1.3' });

        await providerDiscovery.unpublish(app1V1);
        await providerDiscovery.unpublish(app1V2);

        assert.lengthOf(app1Ref, 2);
        assert.lengthOf(app1V1Ref, 1);
        assert.lengthOf(app1V2Ref, 1);
        assert.lengthOf(app1V3Ref, 0);
    });
});
