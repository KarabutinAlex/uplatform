const { up } = require('@uplatform/core');

require('@uplatform/config');
require('@uplatform/logger');

const { MongoClient } = require('mongodb');

up.module('mongo', () => {
    const url = up.config.get('mongo.url');

    const poolSize = up.config.has('mongo.poolSize')
        ? up.config.get('mongo.poolSize')
        : 5;

    const autoReconnect = up.config.has('mongo.autoReconnect')
        ? up.config.get('mongo.autoReconnect')
        : true;

    const client = new MongoClient(url, {
        poolSize,
        autoReconnect,
        useNewUrlParser: true,
    });

    return client;
});
