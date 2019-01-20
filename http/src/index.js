const { up } = require('@uplatform/core');

require('@uplatform/config');

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const createRouter = require('express-promise-router');

class HttpFactory {

    create({
        enableLogging = true,
        enableBodyParser = true,
        enalbeCookieParser = true,
    } = {}) {
        const app = express();

        if (enableLogging) {
            app.use(morgan('combined'));
        }

        if (enalbeCookieParser) {
            app.use(cookieParser());
        }

        if (enableBodyParser) {
            app.use(bodyParser.json());
        }

        return app;
    }
}

up.module('http', () => new HttpFactory());

module.exports = {
    createRouter,
};
