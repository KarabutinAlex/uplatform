const up = require('../bootstrap');

const server = up.http.create();

server.use('/greetings', require('./greeting-routes'));
server.listen(3000);
