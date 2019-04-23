const { RedisBackend } = require('./backends/RedisBackend');
const { ServiceDiscovery } = require('./ServiceDiscovery');

module.exports = {
    RedisBackend,
    ServiceDiscovery,
};
