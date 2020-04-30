const { Ratelimits } = require("./ratelimits");
const { makeDiscordRequest } = require("../request");

class DiscordRequest {
    constructor() {
        this.ratelimits = new Ratelimits();
        this.refreshHook = null;
        this.revokeHook = null;
        this.credentials = null;
    }

    setCredentials({ client_id, client_secret, redirect_uri}) {
        this.credentials = {
            client_id,
            client_secret,
            redirect_uri
        };
    }

    request(endpoint, containerId, options, context) {
        let error;
        if (context.userType == "user") {
            if (!this.credentials) {
                error = new Error("Credentials not set");
            }
        }
        return new Promise((resolve, reject) => {
            if (error) throw error;
            this.ratelimits.get(containerId).addToQueue(endpoint.id, (callback) => {
                return makeDiscordRequest(endpoint, options, {
                    refreshHook: this.refreshHook,
                    revokeHook: this.revokeHook,
                    ...context,
                    containerId,
                    endpointId: endpoint.id,
                    containers: this.ratelimits,
                    credentials: this.credentials,
                }).then((res) => {
                    callback(res.headers);
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
        });
    }

    addHook(event, hook) {
        if (event === "token-update") {
            this.refreshHook = hook;
            return true;
        }
        else if (event === "token-revoke") {
            this.revokeHook = hook;
            return true;
        }
        return false;
    }
}

module.exports = new DiscordRequest();
