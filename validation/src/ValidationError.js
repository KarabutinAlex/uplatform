class ValidationError extends Error {

    constructor(violations) {
        super('Validation failed.');
        this.violations = violations;
    }
}

module.exports = { ValidationError };
