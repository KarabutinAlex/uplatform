require('@uplatform/config');
require('@uplatform/http');

const { up } = require('@uplatform/core');

const server = up.http.create();

server.use('/greetings', require('./greeting-routes'));

server.on('listening', address => {
    console.log(`Server started listening at ${address.port} port.`);
});

server.listen(3000);
