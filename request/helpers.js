function makeOutput(response, options, data) {
    response.rawBody = data;
    if (options.json !== false) {
        response.body = JSON.parse(data);
    } else {
        response.body = data;
    }
    return response;
}

function methodHasBody(method) {
    return (method === "PATCH" ||
            method === "POST" ||
            method === "PUT" );
}

module.exports = {
    makeOutput,
    methodHasBody
};
