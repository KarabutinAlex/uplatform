const up = require('./bootstrap');

up.eventBus.consume(
    'hello', 
    ({ id, payload, tags }, ack) => {
        up.logger.info('Message "hello": %o', { id, payload, tags });
        ack();
    },
);

setTimeout(
    () => up.eventBus.publish('test', {
        type: 'hello',
        payload: {
            userId: 1,
        },
        tags: {
            tag1: 'value1',
        },
        shardingValue: 'user_1',
    }),
    5000,
);
