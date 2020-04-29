const req = require("../core");
const { endpoints } = require("../core/data/endpoints");

class DiscordBot {
    constructor(botToken, botId) {
        this.token = botToken;
        this.botId = botId;
    }

    _makeContext() {
        return {};
    }

    getBot() {
        return req.request(endpoints.userMe, this.botId, {
            bot: this.token
        }, this._makeContext());
    }

    editChannel(channelId, body) {
        return req.request(
            endpoints.modifyChannel,
            this.botId,
            {
                bot: this.token,
                params: {
                    channelId
                },
                body,
            },
            this._makeContext()
        );
    }
};

module.exports = {
    DiscordBot
};
