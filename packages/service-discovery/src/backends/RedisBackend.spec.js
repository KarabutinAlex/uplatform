const { expect, assert } = require('chai');
const { RedisBackend } = require('./RedisBackend');

describe('RedisBackend', () => {

    let backend = null;

    beforeEach(async () => {
        backend = new RedisBackend({
            url: process.env['REDIS_URL'] || 'redis://127.0.0.1:6379',
        });

        await backend.cleanup();
    });

    afterEach(async () => {
        if (backend !== null) {
            await backend.close();
        }
    });

    it('lists created records', async () => {
        await backend.create(1, { id: 1, value: 100 });
        await backend.create(2, { id: 2, value: 200 });

        const records = await backend.list();

        expect(records).to.deep.include.members([
            { id: 1, value: 100 },
            { id: 2, value: 200 },
        ]);
    });

    it('lists created entries without deleted ones', async () => {
        await backend.create(1, { id: 1, value: 100 });
        await backend.create(2, { id: 2, value: 200 });
        await backend.delete(1);

        const records = await backend.list();

        assert.deepEqual(records, [
            { id: 2, value: 200 },
        ]);
    });
});
