const { callRequest } = require("./call");
const { startRatelimit } = require("../helpers/sleep");
const { prepareRequest } = require("./prepare");
const { HttpError } = require("../core/data/errors");
const { bucketRegister } = require("../core/data/bucketRegister");

async function retryLogic(cb, ops, amount) {
    try {
        return await cb(ops);
    } catch (error) {
        if (error instanceof HttpError) {
            if (error.code === 429) {
                console.log("handle ratelimit");
                if (error.data.body.global === true) {
                    // TODO add global ratelimit
                    console.log("429 global ratelimit encountered");
                } else {
                    console.log("429 local ratelimit encountered");
                    const container = ops.context.containers.get(ops.context.containerId);
                    const bucketId = bucketRegister.get(ops.context.endpointId);
                    container.set(
                        bucketId,
                        error.data.headers["x-ratelimit-remaining"],
                        error.data.headers["x-ratelimit-reset"]
                    );
                    await startRatelimit(container.getRate(bucketId), true);
                }
                amount++;
            } else if (error.code === 401 && ops.userDetails) {
                if (ops.raw.options.userDetails && !ops.context.triedRefresh) {
                    console.log("handle token refresh");
                    ops.context.triedRefresh = true;
                    amount++;
                }
            } else {
                throw error;
            }
        }
        if (amount <= 1)
            throw error;
        return retryLogic(cb, ops, amount - 1);
    }
}

async function makeRequest(endpoint, options, context) {
    const requestOptions = prepareRequest(endpoint, options, context);
    try {
        return await retryLogic(callRequest, requestOptions, requestOptions.retries);
    } catch (e) {
        throw e;
    }
}

module.exports = {
    makeRequest
};
