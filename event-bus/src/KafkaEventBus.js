const { KafkaConsumer, Producer } = require('node-rdkafka');
const uuidv4 = require('uuid/v4');

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
        });

        this.connect();
    }

    createProducer({ brokers }) {
        const producer = new Producer({
            'metadata.broker.list': brokers.join(','),
            'dr_cb': true
        });

        producer.on('ready', () => console.log('producer is ready'));
        producer.on('event.error', error => console.error('Error from producer:', error));

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

        consumer.on('event.error', error => {
            console.error('Error from consumer:', error);
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

    publish(topic, { type, payload, tags = {}, shardingValue = null }) {
        try {
            this.producer.produce(
                topic,
                -1,
                Buffer.from(
                    JSON.stringify({
                        id: uuidv4(),
                        type,
                        payload,
                        tags,
                    })
                ),
                shardingValue,
                Date.now(),
            );
        } catch (error) {
            console.error('A problem occurred when sending our message');
            console.error(err);
        }
    }
}

module.exports = {
    KafkaEventBus,
};
