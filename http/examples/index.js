require('@uplatform/config');
require('../src'); // @uplatform/http

const { up } = require('@uplatform/core');

const server = up.http.create();

server.get(
    '/greeting',
    async (request, reply) => {
        const greeting = await Promise.resolve('Hello!')
        reply.json({ greeting });
    },
);

server.listen(8000, () => {
    console.log('server started listening on 8000 port');
});
