const { up } = require('@uplatform/core');
const { createRouter } = require('@uplatform/http');
const router = createRouter();

const { sql } = up.pg;

router.get(
    '/hello',
    async (request, reply) => {
        const version = await sql`select version()`;

        reply.json({
            message: 'Hello!',
            version,
        });
    },
);

module.exports = router;
