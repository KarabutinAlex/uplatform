require('@uplatform/config');
require('@uplatform/http');

const { up } = require('@uplatform/core');

const server = up.http.create();

server.use('/greetings', require('./greeting-routes'));
server.listen(3000);
