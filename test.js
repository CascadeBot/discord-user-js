const { DiscordUser, DiscordBot } = require("./index");

const botClient = new DiscordBot(require("./config.json").bot);

botClient.getBot().then(({body}) => {
    console.log("Bot user: ", body);
}).catch((err) => {
    console.error("Something went wrong: ", err);
});
