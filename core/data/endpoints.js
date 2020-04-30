const endpoints = {
    userMe: {
        path: "/users/@me",
        method: 'GET',
        id: "1"
    },
    getMessage: {
        path: "/channels/:channelId:/messages/:messageId:",
        params: ["channelId", "messageId"],
        method: "GET",
        id: "2"
    },
    modifyChannel: {
        path: "/channels/:channelId:",
        params: ["channelId"],
        method: "PATCH",
        id: "3"
    },
    oauthToken: {
        oauth: true,
        path: "/token",
        method: "POST",
        id: "4"
    },
    oauthRevoke: {
        oauth: true,
        path: "/token/revoke",
        method: "POST",
        id: "5"
    },
    getGuild: {
        path: "/guilds/:guildId:?with_counts=:withCounts:",
        params: ["guildId", "withCounts"],
        method: "GET",
        id: "6"
    },
    userGuilds: {
        path: "/users/@me/guilds",
        method: 'GET',
        id: "7"
    },
};

module.exports = {
    endpoints
};
