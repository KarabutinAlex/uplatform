const winston = require('winston');

class Logger {
    
    constructor({ level }) {
        this.logger = winston.createLogger({
            level,
            transports: [
                new winston.transports.Console(),
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
    }
}

module.exports = { Logger };
