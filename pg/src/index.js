const { up } = require('@uplatform/core');

require('@uplatform/config');
require('@uplatform/logger');

const DEFAULT_CONNECTION_TIMEOUT = 0;
const DEFAULT_IDLE_TIMEOUT = 10000;
const DEFAULT_POOL_SIZE = 10;

function createQueryShortcut(client) {
    return async (chunks, ...parameters) => {
        let query = '';
    
        for (const chunkIndex in chunks) {
            if (query.length) {
                query += `$${chunkIndex}`;
            }
    
            query += chunks[chunkIndex];
        }

        const result = await client.query(
            query.trim(),
            parameters,
        );

        return result.rows;
    };
}

up.module('pg', () => {
    let PostgreSQL = require('pg');

    if (up.hasModule('tracer')) {
        const zipkinClient = require('zipkin-instrumentation-postgres');
        PostgreSQL = zipkinClient(up.tracer, PostgreSQL);
    }

    const { Pool } = PostgreSQL;
    const databaseUrl = up.config.get('database.url');
    const connectionTimeout = up.config.has('database.connectionTimeout')
        ? up.config.has('database.connectionTimeout')
        : DEFAULT_CONNECTION_TIMEOUT;

    const idleTimeout = up.config.has('database.idleTimeout')
        ? up.config.has('database.idleTimeout')
        : DEFAULT_IDLE_TIMEOUT;

    const poolSize = up.config.has('database.poolSize')
        ? up.config.get('database.poolSize')
        : DEFAULT_POOL_SIZE;

    const pool = new Pool({
        connectionString: databaseUrl,
        connectionTimeoutMillis: connectionTimeout,
        idleTimeoutMillis: idleTimeout,
        max: poolSize,
    });

    const sql = createQueryShortcut(pool);
    
    let isReady = false;
    const connecting = pool.connect().then(client => {
        isReady = true;
        client.release();
    });

    return Object.freeze({
        ...pool,
        sql,
        ready: () => isReady ? Promise.resolve() : connecting,
    });
});

module.exports = {
    createQueryShortcut,
};
