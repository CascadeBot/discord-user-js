const { callRequest } = require("./call");
const { prepareRequest } = require("./prepare");

async function retryLogic(cb, ops, amount) {
    try {
        return await cb(ops);
    } catch (error) {
        if (amount <= 1)
            throw error;
        return retryLogic(cb, ops, amount - 1);
    }
}

async function makeOauthRequest(endpoint, options, context) {
    const requestOptions = prepareRequest(endpoint, options, context);
    try {
        return await retryLogic(callRequest, requestOptions, 1);
    } catch (e) {
        throw e;
    }
}

module.exports = {
    makeOauthRequest
}