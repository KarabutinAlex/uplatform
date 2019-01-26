const { KafkaConsumer, Producer } = require('node-rdkafka');
const uuidv4 = require('uuid/v4');

class KafkaEventBus {

    constructor(logger, { groupId, brokers, topics }) {
        this.logger = logger;
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
        });

        this.connect();
    }

    createProducer({ brokers }) {
        const producer = new Producer({
            'metadata.broker.list': brokers.join(','),
            'dr_cb': true
        });

        producer.on('ready', () => {
            this.logger.verbose('Producer is ready.');
        });

        producer.on('event.error', error => {
            this.logger.captureException(error);
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
            this.logger.verbose('Consumer is ready.');

            if (topics.length) {
                consumer.subscribe(topics);
                consumer.consume();
            }
        });

        consumer.on('data', data => {
            this.logger.debug('Received a message (%d bytes) from "%s"', data.size, data.topic);

            const message = JSON.parse(data.value.toString());

            if (!handlers.has(message.type)) return;

            const handler = handlers.get(message.type);

            try {
                const result = handler(message, error => {
                    if (error) {
                        return this.logger.captureException(error);
                    }

                    consumer.commitMessage(data);
                });

                if (result && result.catch) {
                    result.catch(error => {
                        this.logger.captureException(error);
                    });
                }
            } catch (error) {
                this.logger.captureException(error);
            }
        });

        consumer.on('event.error', error => {
            this.logger.captureException(error);
        });

        return consumer;
    }

    connect() {
        this.consumer.connect();
        this.producer.connect();
        this.producerPoller = setInterval(
            () => this.producer.poll(), 
            1000,
        );
    }

    disconnect() {
        if (this.producerPoller) {
            clearInterval(this.producerPoller);
        }

        this.producer.disconnect();
        this.consumer.disconnect();
    }

    consume(event, handler) {
        this.handlers.set(event, handler);
    }

    publish(type, payload, { topic, tags = {}, shardKey = null }) {
        try {
            this.producer.produce(
                topic || type,
                -1,
                Buffer.from(
                    JSON.stringify({
                        id: uuidv4(),
                        type,
                        payload,
                        tags,
                    })
                ),
                shardKey,
                Date.now(),
            );
        } catch (error) {
            this.logger.captureException(error);
        }
    }
}

module.exports = {
    KafkaEventBus,
};
