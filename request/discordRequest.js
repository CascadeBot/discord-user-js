const { callRequest } = require("./call");
const { startRatelimit } = require("../helpers/sleep");
const { prepareRequest } = require("./prepare");
const { HttpError } = require("../core/data/errors");
const { bucketRegister } = require("../core/data/bucketRegister");
const { refreshToken } = require("../oauth/refresh");

async function retryLogic(cb, ops, amount) {
    const container = ops.context.containers.get(ops.context.containerId);
    if (container.globalRate.active !== false) {
        await container.globalRate.active;
    }
    try {
        return await cb(ops);
    } catch (error) {
        if (error instanceof HttpError) {
            if (error.code === 429) {
                if (error.data.body.global === true) {
                    container.startGlobalRatelimit(error.data.body.retry_after);
                } else {
                    const bucketId = bucketRegister.get(ops.context.endpointId);
                    container.set(
                        bucketId,
                        error.data.headers["x-ratelimit-remaining"],
                        error.data.headers["x-ratelimit-reset"]
                    );
                    await startRatelimit(container.getRate(bucketId), true);
                }
                amount++;
            } else if (error.code === 401 && ops.context.userType === "user") {
                if (ops.context.triedRefresh !== true) {
                    const details = await ops.context.user._updateTokens(ops.context);
                    if (details === false)
                        throw error;
                    ops.context.triedRefresh = true;
                    amount++;
                } else {
                    throw error;
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

async function makeDiscordRequest(endpoint, options, context) {
    const requestOptions = prepareRequest(endpoint, options, context);
    try {
        return await retryLogic(callRequest, requestOptions, requestOptions.retries);
    } catch (e) {
        throw e;
    }
}

module.exports = {
    makeDiscordRequest
}