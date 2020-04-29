const https = require("https");
const { errAbort } = require("../core/data/errors");
const { makeOutput } = require("./helpers");

function callRequest(ops, resolve, reject) {
    let data = "";
    // TODO add user agent
    const req = https.request(ops.options);
    req.once('response', (res) => {
        res.on('data', (d) => {
            data += d;
        });
        res.on('end', () => {
            // handle 429 and 401 response code
            resolve(makeOutput(res, ops.options, data));
        });
        res.on('aborted', () => {
            reject(errAbort);
        });
    });

    req.once('error', (e) => {
        console.error(e);
        reject(e);
    });

    if (ops.body) {
        req.write(ops.body);
    }
    req.end();
}

module.exports = {
    callRequest
};
