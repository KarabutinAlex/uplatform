const { createLogger, format, transports } = require('winston');

class Logger {
    
    constructor({ level, sentry }) {
        this.logger = createLogger({
            level,
            format: format.combine(
                format.splat(),
                format.colorize(),
                format.simple()
            ),
            transports: [
                new transports.Console(),
            ],
        });
    }

    silly(...args) {
        this.logger.silly(...args);
    }

    debug(...args) {
        this.logger.debug(...args);
    }

    verbose(...args) {
        this.logger.verbose(...args);
    }

    info(...args) {
        this.logger.info(...args);
    }

    warn(...args) {
        this.logger.warn(...args);
    }

    error(...args) {
        this.logger.error(...args);
    }

    captureException(error) {
        this.logger.error('[%s] %s', error.name, error.message);

        if (this.sentry) {
            this.sentry.captureException(error);
        }
    }
}

module.exports = { Logger };
