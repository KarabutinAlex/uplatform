const { up } = require('@uplatform/core');

require('@uplatform/config');
require('@uplatform/logger');

const { Pool } = require('pg');

const DEFAULT_CONNECTION_TIMEOUT = 0;
const DEFAULT_IDLE_TIMEOUT = 10000;
const DEFAULT_POOL_SIZE = 10;

function createQueryShortcut(client) {
    return (chunks, ...parameters) => {
        let query = '';
    
        for (const chunkIndex in chunks) {
            if (query.length) {
                query += `$${chunkIndex}`;
            }
    
            query += chunks[chunkIndex];
        }

        return client.query(
            query.trim(),
            parameters,
        );
    };
}

up.module('pg', () => {
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

    return Object.freeze({ ...pool, sql });
});

module.exports = {
    createQueryShortcut,
};
