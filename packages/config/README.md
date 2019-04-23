uPlatform - Config Component
============================

[![npm version](https://badge.fury.io/js/%40uplatform%2Fconfig.svg)](https://www.npmjs.com/@uplatform/config)
[![license](https://img.shields.io/npm/l/%40uplatform%2Fconfig.svg)](LICENSE)

## Usage

Step 1. Install the module

```sh
npm install --save @uplatform/config
```

Step 2. Configure the config sources

```js
const configRetriever = new ConfigRetriever({
    stores: [
        {
            type: 'http',
            url: 'http//some-host/some-path/config.json',
        },
        {
            type: 'env',
            keys: {
                DATABASE_URL: 'database.url',
            },
        },
    ],
});

const config = await configRetriever.getConfig();

console.log(config.database.url);
```

## Supported config sources

* Environment variables
* Files
* HTTP endpoints

## Supported config formats

* JSON
* YAML (requires `npm install --save js-yaml`)

# TODO

1. Describe a functionality of "optional" stores.
2. Describe existing stores API

# Roadmap

* Implement an API for loading own config parses
* Implement an API for loading own config stores
* Add support of configuration state services (e.g. etcd, zookeeper, consul)

# Authors

* Karabutin Alex
