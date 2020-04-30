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
    }
};

module.exports = {
    endpoints
};
