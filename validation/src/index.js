const form = require('express-form');
const { field } = require('./Field');
const { ValidationError } = require('./ValidationError');

const middleware = (...fields) => {
    const formHandler = form(...fields);

    return (request, reply, next) => {
        formHandler(request, reply, () => {
            if (!request.form.isValid) {
                throw new ValidationError(request.form.getErrors());
            }

            next();
        });
    };
}

function errorHandler() {
    return (error, request, reply, next) => {
        if (error instanceof ValidationError) {
            return reply
                .status(406)
                .json({
                    errorCode: 'PASSED_INVALID_DATA',
                    violations: error.violations,
                });
        }

        next(error);
    };
}

module.exports = {
    form: middleware,
    field,
    errorHandler,
    ValidationError,
};
