const Postgrator = require('postgrator');
const up = require('./bootstrap');

up.module('migrator', () => {
    const migrationDirectory = up.config.has('database.migrationDirectory')
        ? up.config.get('database.migrationDirectory')
        : './migrations';

    return new Postgrator({
        driver: 'pg',
        migrationDirectory,
        connectionString: up.config.get('database.url'),
        ssl: false,
    });
});
