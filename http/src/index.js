const { up } = require('@uplatform/core');

require('@uplatform/logger');

const createRouter = require('express-promise-router');
const { HttpFactory } = require('./HttpFactory');

up.module('http', () => {
    const logger = up.logger;
    const tracer = up.hasModule('tracer') ? up.tracer : null;

    return new HttpFactory({
        logger, 
        tracer
    });
});

module.exports = {
    createRouter,
};
