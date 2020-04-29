const { DiscordBot } = require("./index");

const botClient = new DiscordBot(require("./config.json").bot);

botClient.getBot().then((res) => {
    console.log("Bot user one: ", res.body);
}).catch((err) => {
    console.error("Something went wrong: ", err);
});
