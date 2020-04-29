const { Ratelimits } = require("./ratelimits");
const { makeRequest } = require("../request");

class DiscordRequest {
    constructor() {
        this.ratelimits = new Ratelimits();
    }

    request(endpoint, containerId, options, context) {
        return new Promise((resolve, reject) => {
            this.ratelimits.get(containerId).addToQueue(endpoint.id, (callback) => {
                return makeRequest(endpoint, {
                    ...options
                }, {
                    ...context,
                    containerId,
                    endpointId: endpoint.id,
                    containers: this.ratelimits
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
