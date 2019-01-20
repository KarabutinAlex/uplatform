require('@uplatform/config');
require('@uplatform/http');

const { up } = require('@uplatform/core');
const { createRouter } = require('@uplatform/http');

const server = up.http.create();

const greetingRoutes = createRouter();

greetingRoutes.get(
    '/hello',
    async (request, reply) => {
        const greeting = await Promise.resolve('Hello!');
        reply.json({ greeting });
    },
);

server.use('/greetings', greetingRoutes);

server.on('listening', address => {
    console.log(`Server started listening at ${address.port} port.`);
});

server.listen(8000);
