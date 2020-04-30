const req = require("../core");
const { endpoints } = require("../core/data/endpoints");

class DiscordBot {
    /* SETUP */
    constructor(botToken, botId) {
        this.token = botToken;
        this.botId = null;
        if (botId)
            this.botId = botId;
    }

    _makeContext() {
        return {
            userType: "bot",
            bot: this.token
        };
    }

    addHook(event, hook) {
        return false;
    }

    /* endpoints */
    getBot() {
        return req.request(endpoints.userMe, this.botId, {}, this._makeContext());
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
