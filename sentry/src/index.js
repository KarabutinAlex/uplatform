const os = require('os');
const { up } = require('@uplatform/core');
const Sentry = require('@sentry/node');

require('@uplatform/config');

const DEFAULT_MAX_BREADCRUMBS = 100;

up.module('sentry', () => {
    const dsn = up.config.get('sentry.dsn');
    const environment = up.config.get('sentry.environment');

    const maxBreadcrumbs = up.config.get('sentry.maxBreadcrumbs')
        ? up.config.get('sentry.maxBreadcrumbs')
        : DEFAULT_MAX_BREADCRUMBS;

    const serverName = up.config.get('sentry.serverName')
        ? up.config.get('sentry.serverName')
        : os.hostname();

    Sentry.init({
        dsn,
        environment,
        maxBreadcrumbs,
        serverName,
    });

    return Object.freeze({
        captureException: Sentry.captureException,
        requestHandler: Sentry.Handlers.requestHandler,
        errorHandler: Sentry.Handlers.errorHandler,
    });
});
