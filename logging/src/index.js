const { up } = require('@uplatform/core');
require('@uplatform/config');
const { Logger } = require('./Logger');

up.module('logger', () => {
    const level = up.config.has('logger.lever') 
        ? up.config.get('logger.lever') 
        : 'info';

    return new Logger({ level });
});
