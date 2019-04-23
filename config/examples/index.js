const { up } = require('@uplatform/core');

require('../src/index'); // @uplatform/config

try {
    const port = up.config.get('application.port');
    console.log(`Service started listening on ${port} port.`);
} catch (error) {
    console.error(error);
}
