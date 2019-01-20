const { up } = require('@uplatform/core');
require('@uplatform/config');
const { Logger } = require('./Logger');

up.module('logger', () => {
    const level = up.config.has('logger.level') 
        ? up.config.get('logger.level') 
        : 'info';

    return new Logger({ level });
});
