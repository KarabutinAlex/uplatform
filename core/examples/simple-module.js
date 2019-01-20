const { up } = require('../src');

up.module('counter', () => {
    console.log('counter.init');

    let counter = 0;

    const increase = () => ++counter;
    const value = () => counter;

    return {
        increase,
        value,
    };
});

console.log('Current:', up.counter.value());
console.log('New:', up.counter.increase());
console.log('Current:', up.counter.value());
