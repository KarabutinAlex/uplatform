const { up } = require('@uplatform/core');
const config = require('config');

up.module(
    'config',
    () => config,
);
