const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { expressMiddleware: zipkinMiddleware } = require('zipkin-instrumentation-express');

class HttpFactory {

    constructor({ logger, tracer }) {
        this.logger = logger;
        this.tracer = tracer;
    }

    create({
        enableLogging = true,
        enableBodyParser = true,
        enableCookieParser = true,
        enableTracing = true,
        enableValidation = true,
    } = {}) {
        const app = express();

        if (enableLogging) {
            app.use(morgan('combined'));
        }

        if (enableTracing && this.tracer) {
            app.use(zipkinMiddleware({ tracer: this.tracer }));
        }

        if (enableCookieParser) {
            app.use(cookieParser());
        }

        if (enableBodyParser) {
            app.use(bodyParser.json());
        }

        return Object.freeze({
            ...app,
            listen: (...args) => {
                const server = app.listen(...args);
                const address = server.address();

                setImmediate(() => app.emit('listening', address));

                this.logger.info(`Server started listening at %d port.`, address.port);

                return app;
            },
        });
    }
}

module.exports = {
    HttpFactory,
};
