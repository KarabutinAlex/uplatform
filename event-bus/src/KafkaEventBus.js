const { KafkaConsumer, Producer } = require('node-rdkafka');

class KafkaEventBus {

    constructor({ groupId, brokers, topics }) {
        this.handlers = new Map();
        this.groupId = groupId;
        this.brokers = brokers;
        this.topics = topics;

        this.producer = this.createProducer({ brokers });
        this.consumer = this.createConsumer({
            handlers: this.handlers,
            groupId,
            brokers,
            topics,
        })
    }

    createProducer() {
        const producer = new Producer({
            'metadata.broker.list': brokers.join(','),
            'dr_cb': true
        });

        producer.on('ready', () => {
            // ...
        });

        return producer;
    }

    createConsumer({ handlers, groupId, brokers, topics }) {
        const consumer = new KafkaConsumer(
            {
                'client.id': Math.round(Math.random() * Number.MAX_SAFE_INTEGER).toString(16),
                'group.id': groupId,
                'metadata.broker.list': brokers.join(','),
                'enable.auto.commit': false,
            },
            {
                'auto.offset.reset': 'earliest',
            },
        );

        consumer.on('ready', () => {
            consumer.subscribe(topics);
            consumer.consume();
        });

        consumer.on('data', data => {
            const message = JSON.parse(data.value.toString());

            if (!handlers.has(message.type)) return;

            const handler = handlers.get(message.type);
            
            handler(message, error => {
                if (error) {
                    return console.error({ error, tags: message.tags });
                }

                consumer.commitMessage(data);
            });
        });
    }

    connect() {
        this.consumer.connect();
        this.producer.connect();
    }

    disconnect() {
        this.producer.disconnect();
        this.consumer.disconnect();
    }

    consume(event, handler) {
        this.handlers.set(event, handler);
    }

    publish(topic, { type, payload, tags = {}, shardingValue = null }) {
        this.producer.produce(
            topic,
            null,
            Buffer.from(
                JSON.stringify({
                    id: '',
                    type,
                    payload,
                    tags,
                })
            ),
            shardingValue,
            Date.now(),
        );
    }
}

module.exports = {
    KafkaEventBus,
};
