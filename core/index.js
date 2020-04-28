const { Ratelimits } = require("./requestCache");
const { makeRequest } = require("./request");

class DiscordRequest {
    constructor() {
        this.ratelimits = new Ratelimits();
    }

    request(endpoint, options, body) {
        return new Promise((resolve, reject) => {
            this.ratelimits.get("bot").addToQueue(endpoint.id, (callback) => {
                return makeRequest(endpoint, {
                    ...options,
                    body: body
                }).then((res) => {
                    callback(res.headers);
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
        });
    }
}

module.exports = new DiscordRequest();
