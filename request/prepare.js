const qs = require('querystring');
const { defaultRequestOptions, discordApiVersion } = require("../core/data/request");
const { methodHasBody } = require("./helpers");

function beforeCall(ops) {
    if (ops.context.userType == "bot")
        ops.options.headers["Authorization"] = "Bot " + ops.context.bot;
    else if (ops.context.userType == "user")
        ops.options.headers["Authorization"] = "Bearer " + ops.context.user._getDetails().accessToken;
}

function prepareRequest(endpoint, options, context) {
    const headers = {
        "Content-Type": "application/json"
    };
    let json = true;

    let path = "" + endpoint.path;
    if (endpoint.params) {
        endpoint.params.forEach((val) => {
            path = path.replace(`:${val}:`, options.params[val]);
        });
    }
    
    if (options.body && endpoint.oauth === true) {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        json = false;
        options.body = {
            ...options.body,
            client_id: context.credentials.client_id,
            client_secret: context.credentials.client_secret
        }
    }

    let body;
    if (methodHasBody(endpoint.method)) {
        if (!options.body) {
            body = json ? "{}" : "";
        } else if (json) {
            body = JSON.stringify(options.body);
        } else {
            body = qs.stringify(options.body)
        }
    }
    
    if (endpoint.oauth === true) {
        path = `/oauth2${path}`;
    }
    
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
        retries: 5,
        context,
        body,
    }
}

module.exports = {
    prepareRequest,
    beforeCall
};
