const { up } = require('@uplatform/core');

require('@uplatform/logging');

const createRouter = require('express-promise-router');
const { HttpFactory } = require('./HttpFactory');

up.module('http', () => new HttpFactory(up.logger));

module.exports = {
    createRouter,
};
