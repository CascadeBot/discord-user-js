const DiscordCore = require("./core");
const { failAuthNextCall } = require("./request");
const hooks = require("./core/data/hooks");
const debugFuncs = require("./helpers/debug");
const { DiscordBot } = require("./bot");
const { DiscordUser } = require("./user");

module.exports = {
    DiscordCore,
    DiscordHooks: hooks,
    DiscordDebug: {
        failAuthNextCall,
        ...debugFuncs
    },
    DiscordUser,
    DiscordBot
};
