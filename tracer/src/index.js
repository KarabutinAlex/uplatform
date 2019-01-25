const { up } = require('@uplatform/core');

require('@uplatform/config');

const { Tracer, BatchRecorder, jsonEncoder: { JSON_V2 }} = require('zipkin');
const CLSContext = require('zipkin-context-cls');
const { HttpLogger } = require('zipkin-transport-http');

up.module('tracer', () => {
    const tracerUrl = up.config.has('tracer.url')
        ? up.config.get('tracer.url')
        : 'http://127.0.0.1:9411';

    const ctxImpl = new CLSContext('zipkin');
    const localServiceName = up.config.get('tracer.serviceName');
    const recorder = new BatchRecorder({
        logger: new HttpLogger({
            endpoint: `${tracerUrl}/api/v2/spans`,
            jsonEncoder: JSON_V2
        })
    });

    return new Tracer({
        ctxImpl,
        localServiceName,
        recorder,
    });
});
