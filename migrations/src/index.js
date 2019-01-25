const Postgrator = require('postgrator');
const up = require('./bootstrap');

up.module('migrator', () => {
  return new Postgrator({
      driver: 'pg',
      migrationDirectory: config.database.migrationDirectory,
      connectionString: config.database.url,
      ssl: false,
    });
});
