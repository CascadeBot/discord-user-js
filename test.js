const { DiscordBot } = require("./index");

const botClient = new DiscordBot(require("./config.json").bot, "bot");

for (let i = 0; i < 6; i++) {
    botClient.editChannel("531072515741843469", { name: "new-name" }).then((res) => {
        console.log("Bot user one: ", res.body);
    }).catch((err) => {
        console.error("Something went wrong: ", err);
    });
}
