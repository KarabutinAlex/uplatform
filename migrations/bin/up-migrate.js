#!/usr/bin/env node
const { up } = require('@uplatform/core');

require('../src/index');

function usage() {
    console.log('Usage:');
    console.log('  up-migrate [version]')
}

const args = process.argv.slice(2);

if (args.indexOf('--help') >= 0) {
    usage();
    process.exit(0);
}

(async () => {
    try {
        const [version] = args;
        const appliedMigrations = await up.migrator.migrate(version);

        up.logger.info('Applied %d migrations.', appliedMigrations.length);

        for (const migration of appliedMigrations) {
            up.logger.verbose('- %s', migration.filename);
        }
    } catch (error) {
        up.logger.error('Migration failed.');
        up.logger.captureException(error);
    }
})();
