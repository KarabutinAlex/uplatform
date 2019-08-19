const http = require('http');

function createHttpServer(requestHandler) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(requestHandler);

    server.listen(0, (error) => {
      if (error) {
        reject(new Error(`Can't start HTTP server: ${error.message}`));
        return;
      }

      resolve(server);
    });
  });
}

module.exports = {
  createHttpServer,
};
