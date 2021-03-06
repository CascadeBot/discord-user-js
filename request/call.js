const https = require("https");
const { errors, HttpError } = require("../core/data/errors");
const { makeOutput } = require("./helpers");
const { beforeCall } = require("./prepare");

let failAuth = false;

function failAuthNextCall() {
    failAuth = true;
}

function callRequest(ops) {
    beforeCall(ops);
    return new Promise((resolve, reject) => {
        let data = "";
        // TODO add user agent
        const req = https.request(ops.options);
        req.once('response', (res) => {
            res.on('data', (d) => {
                data += d;
            });

            res.on('end', () => {
                const output = makeOutput(res, ops.options, data);
                if (failAuth) {
                    failAuth = false;
                    res.statusCode = 401;
                }
                if (res.statusCode >= 400 && res.statusCode <= 600) {
                    return reject(
                        new HttpError(errors.httpError, res.statusCode, output)
                    );
                }
                resolve(output);
            });

            res.on('aborted', () => {
                reject(new Error(errors.errAbort));
            });
        });
    
        req.once('error', (e) => {
            reject(e);
        });

        if (ops.body) {
            req.write(ops.body);
        }
        req.end();
    });
}

module.exports = {
    callRequest,
    failAuthNextCall
};
