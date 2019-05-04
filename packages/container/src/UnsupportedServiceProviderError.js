class UnsupportedServiceProviderError extends Error {
    constructor() {
        super('Service provider must be either an object with a method "register" or a function.');
        this.name = 'UnsupportedServiceProviderError';
    }
}

module.exports = {
    UnsupportedServiceProviderError
};
