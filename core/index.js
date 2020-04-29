const { Ratelimits } = require("./ratelimits");
const { makeRequest } = require("../request");

class DiscordRequest {
    constructor() {
        this.ratelimits = new Ratelimits();
    }

    request(endpoint, userId, options, context) {
        return new Promise((resolve, reject) => {
            this.ratelimits.get(userId).addToQueue(endpoint.id, (callback) => {
                return makeRequest(endpoint, {
                    ...options
                }, context).then((res) => {
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
