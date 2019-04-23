const BaseField = require('express-form/lib/field');
const { validators } = require('validator');

class Field extends BaseField {

    isUUID(message) {
        return this.add(value => {
            if (!validators.isUUID(value)) {
              return { error: message || "%s is not uuid" };
            }

            return { valid: true };
        });
    }

    isEmail(message) {
        return this.add(function (value) {
            if (typeof value !== 'string' || !(/^.+\@.+\..+$/i).test(value)) {
                return { error: message || "%s is not an email address" };
            }
            return { valid: true };
        });
    }

    oneOf(validValues, message) {
        return this.add(function (value) {
            if (typeof value !== 'string' || validValues.indexOf(value) < 0) {
                return { error: message || "%s is incorrect value" };
            }
            return { valid: true };
        });
    }
}

/**
 * @param {String} property
 * @param {String} label
 *
 * @returns {Field}
 */
function field(property, label) {
    return new Field(property, label)
}

module.exports = {
    field,
    Field,
};
