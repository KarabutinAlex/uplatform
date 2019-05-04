class UnknownMemberError extends Error {

    constructor(unknownMember) {
        super(`Member "${unknownMember}" is not defined.`);
        this.name = 'UnknownMemberError';
    }
}

module.exports = {
    UnknownMemberError,
};
