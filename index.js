const DiscordRequest = require("./core");
const { endpoints } = require("./core/request");

DiscordRequest.initDiscordRequest({
    bot: require("./config.json").bot
});

DiscordRequest.test(endpoints.modifyChannel);
DiscordRequest.test(endpoints.modifyChannel);
DiscordRequest.test(endpoints.modifyChannel);
DiscordRequest.test(endpoints.getMessage);
DiscordRequest.test(endpoints.getMessage);
DiscordRequest.test(endpoints.getMessage);
DiscordRequest.test(endpoints.userMe);
DiscordRequest.test(endpoints.userMe);
DiscordRequest.test(endpoints.userMe);
