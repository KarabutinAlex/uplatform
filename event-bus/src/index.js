const { up } = require('@uplatform/core');

require('@uplatform/config');

const { KafkaEventBus } = require('./KafkaEventBus');

up.module('eventBus', () => {
    const groupId = up.config.get('eventBus.id');
    const brokers = up.config.get('eventBus.brokers');
    const topics = up.config.get('eventBus.topics');

    return new KafkaEventBus({
        groupId,
        topics,
        brokers: typeof brokers === 'string' ? brokers.split(',') : brokers,
    });
});
