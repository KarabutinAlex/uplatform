require('../src/index'); // @uplatform/event-bus

const { up } = require('@uplatform/core');

//
const ebConfig = {
    eventBus: {
        id: 'worker-1',
        brokers: [
            'localhost:9092',
        ], // or 'host1:9092,host2:9092,host3:9092'
    },
};

const consumer = up.eventBus.consume({
    topics: [
        'users',
    ],
});

consumer.on(
    'user.created',
    ({ payload, tags }, ack) => {
        console.log({ payload, tags });
        ack();
    },
);

// ---

up.eventBus.publish('users', {
    type: 'user.created',
    payload: {
        id: 1,
        name: 'Bob',
    },
    tags: {
        requestId: '14',
    },
});
