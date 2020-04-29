const errors = {
    errAbort: "Connection aborted",
    errIdGenFailed: "Random identifier generation failed",
    httpError: "Http error"
};

class HttpError extends Error {
    constructor(message, code, data) {
        super(message);
        this.name = this.constructor.name;
        this.data = data;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    errors,
    HttpError
};
