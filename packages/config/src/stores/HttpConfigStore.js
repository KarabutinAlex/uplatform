const https = require('https');
const http = require('http');

class HttpConfigStore {
    
    constructor({
        configProcessor,
        url,
    } = {}) {
        this.url = url;
        this.configProcessor = configProcessor;
    }

    async getConfig() {
        const response = await this.fetch(this.url);

        if (response.statusCode >= 400) {
            throw new Error(`Server responded with an error (status code = ${response.statusCode}).`);
        }

        switch (response.contentType) {
            case 'application/json':
                return this.configProcessor.process('json', response.body);

            case 'text/yaml':
                return this.configProcessor.process('yaml', response.body);

            default:
                throw new Error(
                    `Server responded with an unknown data format (content type is "${response.contentType}").`,
                );
        }
    }

    fetch(url) {
        return new Promise((resolve, reject) => {
            try {
                const createRequest = url.match(/^https:/)
                    ? https.request
                    : http.request;

                const request = createRequest(url, response => {
                    const chunks = [];

                    response.on('data', chunk => chunks.push(chunk));
                    response.on('end', () => resolve({
                        statusCode: response.statusCode,
                        contentType: response.headers['content-type'],
                        body: Buffer.concat(
                            chunks,
                            parseInt(response.headers['content-length'] || 0),
                        ),
                    }));
                });

                request.on('error', error => {
                    reject(new Error(`Can't load config from "${url}": ${error.message}`));
                });

                request.end();
            } catch (error) {
                reject(new Error(`Can't send a request to "${url}": ${error.message}`));
            }
        });
    }
}

module.exports = {
    HttpConfigStore,
};
