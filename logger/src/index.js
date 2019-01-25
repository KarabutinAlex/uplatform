const { up } = require('@uplatform/core');
require('@uplatform/config');
const { Logger } = require('./Logger');

up.module('logger', () => {
    const level = up.config.has('logger.level') 
        ? up.config.get('logger.level') 
        : 'info';

    const sentry = up.hasModule('sentry') ? up.sentry : null;

    return new Logger({ level, sentry });
});
