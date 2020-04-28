const { Ratelimits } = require("./requestCache");
const { makeRequest } = require("./request");

class DiscordRequest {
    initDiscordRequest(options) {
        if (options) {
            this.bot = options.bot
        }
        this.ratelimits = new Ratelimits();
    }

    post(id, arg1, arg2) {
        return new Promise((resolve, reject) => {
            this.got.post(arg1, arg2).then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    get(id, arg1, arg2) {
        return this.got.get(arg1, arg2);
    }

    test(endpoint) {
        this.ratelimits.get("bot").addToQueue(endpoint.id, (callback) => {
            return makeRequest(endpoint, {
                botToken: this.bot
            }).then((res) => {
                console.log(res.body);
                callback(res.headers);
            }).catch((err) => {
                console.log(err);
            })
        });
    }
}

module.exports = new DiscordRequest();
