const https = require("https");

const errors = {
    abort: new Error("Connection aborted"),
    idGenFailed: new Error("Random identifier generation failed")
};

const apiVersion = 6;
const endpoints = {
    userMe: {
        path: "/users/@me",
        method: 'GET',
        id: "1"
    },
    getMessage: {
        path: "/channels/531072515741843469/messages/704770178486894619",
        method: "GET",
        id: "2"
    },
    modifyChannel: {
        path: "/channels/531072515741843469",
        method: "PATCH",
        id: "3"
    }
};

// TODO move bucket register inside account scope
const bucketReg = new Map();

function jenerateBucket(depth) {
    if (!depth) depth = 0;
    if (depth > 20) throw errors.idGenFailed;
    const random = "---" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    const values = bucketReg.values();
    for (let val of values) {
        if (random == val)
            return jenerateBucket(depth + 1);
    }
    return random;
}

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

function makeRequest(endpoint, options, context) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (options.bot)
        headers["Authorization"] = "Bot " + options.bot;
    return new Promise((resolve, reject) => {
        let data = "";
        // TODO add user agent
        const req = https.request({
            hostname: 'discordapp.com',
            port: 443,
            path: `/api/v${apiVersion}${endpoint.path}`,
            method: endpoint.method,
            agent: false,
            headers,
        });
        req.once('response', (res) => {
            res.on('data', (d) => {
                data += d;
            });
            res.on('end', () => {
                // handle 429 and 401 response code
                resolve(makeOutput(res, options, data));
            });
            res.on('aborted', () => {
                reject(errors.abort);
            });
        })
        req.once('error', (e) => {
            console.error(e);
            reject(e);
        })
        if (methodHasBody(endpoint.method))
            req.write(JSON.stringify(options.body));
        req.end();
    });
}

module.exports = {
    endpoints,
    makeRequest,
    jenerateBucket,
    bucketReg
}