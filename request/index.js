const { makeDiscordRequest } = require("./discordRequest");
const { makeOauthRequest } = require("./oauthRequest");
const { failAuthNextCall } = require("./call");

module.exports = {
    makeDiscordRequest,
    makeOauthRequest,
    failAuthNextCall
};
