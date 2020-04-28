const req = require("../core");
const { endpoints } = require("../core/request");

class DiscordBot {
    constructor(botToken) {
        this.token = botToken;
    }

    _makeContext() {
        return {};
    }

    getBot() {
        return req.request(endpoints.userMe, {
            bot: this.token
        }, this._makeContext());
    }
};

module.exports = {
    DiscordBot
};
