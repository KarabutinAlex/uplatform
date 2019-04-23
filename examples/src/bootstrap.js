const { up } = require('@uplatform/core');

require('@uplatform/config');
require('@uplatform/tracer');
require('@uplatform/logger');
require('@uplatform/pg');
require('@uplatform/event-bus');
require('@uplatform/http');

module.exports = up;
