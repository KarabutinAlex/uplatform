uPlatform - Service Discovery Component
=======================================

[![npm version](https://badge.fury.io/js/%40uplatform%2Fservice-discovery.svg)](https://www.npmjs.com/@uplatform/service-discovery)
[![license](https://img.shields.io/npm/l/%40uplatform%2Fservice-discovery.svg)](LICENSE)

## How to use

Install the module:

```bash
npm install --save @uplatform/service-discovery
```

Configure the Service Discovery:

```javascript
const { ServiceDiscovery } = require('@uplatform/service-discovery');
const discovery = new ServiceDiscovery({ name: 'my-app-1' });
```

Start Redis:

```bash
docker run --rm -it -p 127.0.0.1:6379:6379/tcp redis
```

Start the application:

```bash
export REDIS_URL=redis://my-redis-url:6379
node app.js
```

**Note:** By default is uses a Redis server as a backend and gets an URL from `REDIS_URL`.

## Snippets

### Publishing a new service instance

```javascript
const instance = await discovery.publish({
    name: 'app-1',
    type: 'http',
    metadata: {
        api: '1.12',
    },
    location: {
        host: '10.0.0.12',
        port: 16784,
        path: '/api/v1',
    },
});
```

### Unpublishing an existing service instance

```javascript
await discovery.unpublish(instance);
```

### Looking up a service by name

```javascript
const serviceRef = await discovery.lookup({
    name: 'app-1',
});
```

### Looking up a service by type

```javascript
const serviceRef = await discovery.lookup({
    name: 'app-1',
    type: 'http',
});
```

### Looking up a service by metadata

```javascript
const serviceRef = await discovery.lookup({
    name: 'app-1',
    type: 'http',
    api: '1.12',
});
```

## TODO

* Implement `ServiceRef.asPgClient()`
* Implement `ServiceRef.asRedisClient()`
* Implement `ServiceRef.asMongoClient()`
* Implement live update of instance list.

## Authors

* Karabutin Alex
