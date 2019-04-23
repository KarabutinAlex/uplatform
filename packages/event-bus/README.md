uPlatform - Event Bus Component
============================

[![npm version](https://badge.fury.io/js/%40uplatform%2Fevent-bus.svg)](https://www.npmjs.com/@uplatform/event-bus)
[![license](https://img.shields.io/npm/l/%40uplatform%2Fevent-bus.svg)](LICENSE)

### Usage

Step 1. Install the module

```shell
npm install --save @uplatform/event-bus
```

Step 2. Configure the event bus

```javascript
const { EventBus } = require('@uplatform/event-bus');

const eventBus = new EventBus({
    name: 'my-service-1',
});
```

Step 3. Start NATS:

```shell
docker run --rm -it -p 127.0.0.1:4222:4222 -p 127.0.0.1:8222:8222 nats
```

Step 4. Start the application:

```shell
export NATS_URL=nats://127.0.0.1:4222
node app.js
```

### Snippets

#### Publish an event

```javascript
await eventBus.publish('users.registered', {
    id: 1,
    name: 'Alex',
});
```

#### Subscribe to events by type

```javascript
await eventBus.subcribe(
    'users.registered',
    message => {
        console.log(message, '@', 'users.registered');
    },
);
```

#### Subscribe to events by mask

```javascript
await eventBus.subcribe(
    'users.*',
    ({ subject, ...message }) => {
        console.log(message, '@', subject);
    },
);
```

#### Send a request

```javascript
await eventBus.request(
    'calculator.sum',
    { a: 10, b: 20 },
    ({ sum }) => {
        console.log(`10 + 20 = ${sum}`);
    },
);
```

#### Reply to the request

```javascript
await eventBus.subscribe(
    'calculator.sum',
    ({ a, b, reply }) => {
        reply({
            sum: a + b,
        });
    },
);
```
