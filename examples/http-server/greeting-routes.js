const { createRouter } = require('@uplatform/http');
const router = createRouter();

router.get(
    '/hello',
    async (request, reply) => {
        const greeting = await Promise.resolve('Hello!');
        reply.json({ greeting });
    },
);

module.exports = router;
