const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressCors = require('cors');
const { errorHandler: validationErrorHandler } = require('@uplatform/validation');

const defaultNotFoundHandler = (request, reply) => {
    reply
        .status(404)
        .json({
            errorCode: 'RESOURCE_NOT_FOUND'
        });
};

const defaultErrorHandler = (error, request, reply, next) => {
    reply
        .status(500)
        .json({
            errorId: reply.sentry,
            errorCode: 'INTERNAL_ERROR',
        });
};

class HttpFactory {

    constructor({
        logger,
        tracer,
        sentry,
    }) {
        this.logger = logger;
        this.tracer = tracer;
        this.sentry = sentry;
    }

    create({
        enableLogging = true,
        enableBodyParser = true,
        enableCookieParser = true,
        enableTracing = true,
        enableValidation = true,
        enableCORS = false,
        notFoundHandler = defaultNotFoundHandler,
        errorHandler = defaultErrorHandler,
        cors,
    } = {}) {
        const app = express();

        if (enableLogging) {
            app.use(morgan('combined'));
        }

        if (enableCORS) {
            app.use(expressCors(cors));
        }

        if (enableTracing && this.tracer) {
            const {
                expressMiddleware: zipkinMiddleware
            } = require('zipkin-instrumentation-express');

            app.use(zipkinMiddleware({ tracer: this.tracer }));
            app.use((req, res, next) => {
                res.set('Trace-ID', req._trace_id.traceId);
                next();
            });
        }

        if (this.sentry) {
            app.use(this.sentry.requestHandler());
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
                app.use(notFoundHandler);

                if (enableValidation) {
                    app.use(validationErrorHandler());
                }

                if (this.sentry) {
                    app.use(this.sentry.errorHandler());
                } else {
                    app.use((error, request, reply, next) => {
                        this.logger.captureException(error);
                        next(error);
                    });
                }

                app.use(errorHandler);

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
