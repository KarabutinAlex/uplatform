const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

class HttpFactory {

    constructor(logger) {
        this.logger = logger;
    }

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

        return {
            ...app,
            listen(...args) {
                const server = app.listen(...args);
                const address = server.address();

                setImmediate(() => app.emit('listening', address));

                this.logger.info(`Server started listening at %d port.`, address.port);

                return app;
            },
        };
    }
}

module.exports = {
    HttpFactory,
};
