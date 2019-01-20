const { up } = require('@uplatform/core');

const createRouter = require('express-promise-router');
const { HttpFactory } = require('./HttpFactory');

up.module('http', () => new HttpFactory());

module.exports = {
    createRouter,
};
