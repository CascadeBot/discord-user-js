const { defaultRequestOptions, discordApiVersion } = require("../core/data/request");
const { methodHasBody } = require("./helpers");

function prepareRequest(endpoint, options, context) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (options.bot)
        headers["Authorization"] = "Bot " + options.bot;
    else if (options.userDetails)
        headers["Authorization"] = "Bearer " + options.userDetails.accessToken;

    let path = "" + endpoint.path;
    if (endpoint.params) {
        endpoint.params.forEach((val) => {
            path = path.replace(`:${val}:`, options.params[val]);
        });
    }

    let body;
    if (methodHasBody(endpoint.method))
        body = options.body ? JSON.stringify(options.body) : "{}";

    return {
        raw: {
            options,
            endpoint,
            path,
        },
        options: {
            ...defaultRequestOptions,
            headers,
            path: `/api/v${discordApiVersion}${path}`,
            method: endpoint.method,
        },
        context,
        body,
    }
}

module.exports = {
    prepareRequest
};
