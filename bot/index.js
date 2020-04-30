const req = require("../core");
const { endpoints } = require("../core/data/endpoints");

class DiscordBot {
    /* SETUP */
    constructor(botToken, userId) {
        this.token = botToken;
        this.botId = null;
        if (userId)
            this.botId = userId;
    }

    _makeContext() {
        return {
            userType: "bot",
            bot: this.token
        };
    }

    /* root functions */
    addHook(event, hook) {
        return false;
    }

    async setup() {
        try {
            const res = await makeOauthRequest(endpoints.userMe, {}, this._makeContext());
            this.details.userId = res.body.id;
            return true;
        } catch (e) {
            return false;
        }
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
                params: {
                    channelId
                },
                body,
            },
            this._makeContext()
        );
    }

    getGuild(guildId, withCounts) {
        return req.request(
            endpoints.getGuild,
            this.botId,
            {
                params: {
                    guildId,
                    withCounts: (!!withCounts).toString()
                }
            },
            this._makeContext()
        );
    }
};

module.exports = {
    DiscordBot
};
