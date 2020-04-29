const { callRequest } = require("./call");
const { prepareRequest } = require("./prepare");

function makeRequest(endpoint, options, context) {
    const requestOptions = prepareRequest(endpoint, options, context);
    return new Promise((resolve, reject) => {
        callRequest(requestOptions, resolve, reject);
    });
}

module.exports = {
    makeRequest
}