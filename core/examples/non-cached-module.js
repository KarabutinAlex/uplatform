const { up } = require('../src');

let counter = 1;

up.module(
    'myModule', 
    () => ({ value: counter++ }),
    { cached: false },
);

console.log('1st getting:', up.myModule.value); // 1st getting: 1
console.log('2nd getting:', up.myModule.value); // 2nd getting: 2
console.log('3rd getting:', up.myModule.value); // 3rd getting: 3
