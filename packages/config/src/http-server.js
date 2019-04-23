const http = require('http');

function createHttpServer(requestHandler) {
    return new Promise((resolve, reject) => {
        const server = http.createServer(requestHandler);

        server.listen(0, error => {
            if (error) {
                return reject(
                    new Error(`Can't start HTTP server: ${e.message}`),
                );
            }

            resolve(server);
        });
    });
}

module.exports = {
    createHttpServer,
};
