const { up } = require('@uplatform/core');

require('@uplatform/config');
require('@uplatform/logger');

const { KafkaEventBus } = require('./KafkaEventBus');

up.module('eventBus', () => {
    const groupId = up.config.get('eventBus.id');
    const brokers = up.config.get('eventBus.brokers');
    const topics = up.config.has('eventBus.topics')
        ? up.config.get('eventBus.topics')
        : [];

    const eventBus = new KafkaEventBus(
        up.logger,
        {
            groupId,
            topics,
            brokers: typeof brokers === 'string' ? brokers.split(',') : brokers,
        }
    );

    return Object.freeze({
        ...eventBus,
        publish: eventBus.publish.bind(eventBus),
    })
});
