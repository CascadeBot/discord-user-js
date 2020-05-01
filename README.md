# discord-user-js
User based discord library for nodejs. Only covers the rest api.

Part of [CascadeBot](https://github.com/CascadeBot/CascadeBot), A modular, costumizable discord toolkit.

## Features
 - Multiple account usage
 - Proper ratelimits (per account, per route)
 - Discord rest api integration
 - Automatic oauth token refresh

## Todo
 - [ ] More endpoints

## why this instead of other libraries
Other discord libraries expect to be used only for bot clients and not for oauth clients.
Some libraries also support the use oauth clients but they don't do ratelimits correctly.

Discord ratelimits work per account, per route. but most libraries only store per route. that means that if one user account gets ratelimited, the entire library waits for that user ratelimit to expiry.

This library does ratelimits per account so that the above scenario doesn't happen.

I don't recommend using this if you only need to use a single bot account. Only use it if you need to handle requests for lots of oauth clients at the same time. All constructors don't make any discord calls so constantly making new users is not a problem.

# Quickstart

```JS
const { DiscordCore, DiscordBot, DiscordUser } = require("discord-user-js");

async function start() {
    // Make a new bot client
    const botClient = new DiscordBot("BOT_TOKEN");
    await botClient.setup();

    // get info you need
    const botInfo = botClient.getBot();

    // DiscordUsers require credentials to be setup
    DiscordCore.setCredentials({
        client_id: "CLIENT_ID",
        client_secret: "CLIENT_SECRET",
        redirect_uri: "REDIRECT_URI"
    })

    // Make new user client
    const userClient = new DiscordUser({
        accessToken: "ACCESS_TOKEN",
        refreshToken: "REFRESH_TOKEN",
        scopes: ["identify"]
    });
    await userClient.setup();

    // get info you need
    const userInfo = userClient.getUser();
}

start();
```

# Documenation

1. [Exports](#Exports)
2. [DiscordCore](#DiscordCore)
3. [DiscordUser](#DiscordUser)
4. [DiscordBot](#DiscordBot)
5. [DiscordHooks](#DiscordHooks)

# Exports
 - DiscordCore: `DiscordCore` - core of the library, used for global configuration
 - DiscordUser: `Class<DiscordUser>` - discord user class, used for making user requests
 - DiscordBot: `Class<DiscordBot>` - discord bot class, used for making bot requests
 - DiscordHooks: `Object` - Object with all possible hooks
 - DiscordDebug: `Object` - Object containing debug functions, used for library development

# DiscordCore

## DiscordCore.setCredentials(credentials)

 - credentials: `Object`
    - client_id: `String` - client id for application
    - client_secret: `String` - client secret for application
 - return value: `undefined` - has no return value

`DiscordCore.setCredentials()` is used for setting up credentials for the use of DiscordUsers. You wont need it if you only need to use bot endpoints.

**example:**
```JS
DiscordCore.setCredentials({
    client_id: "CLIENT_ID",
    client_secret: "CLIENT_SECRET"
    redirect_uri: "REDIRECT_URI"
});
```
---
## DiscordCore.addHook(event, hook)
 - event: `String` - event to hook onto, see [DiscordHooks](#DiscordHooks) for all hooks
 - hook: `Function` - function to execute when event fires, see [DiscordHooks](#DiscordHooks) for more info on the hooks
 - return value: `Boolean` - returns `true` if succesfull, can only fail if you use a nonexistent event

Used for setting up a global hook across all clients.

**note:** If hook is an async function (or returns a promise) it will wait for it to finish until it continues.

**note:** If a client already has a hook on the event, the client hook has priority and the global hook wont execute.

**example:**
```JS
DiscordCore.addHook(DiscordHooks.tokenUpdate, (userDetails) => {
    console.log(userDetails);
});
```

# DiscordUser

## new DiscordUser(userDetails)
 - userDetails: `Object`
    - accessToken: `String` - access token for user
    - refreshToken: `String` - refresh token for user
    - scopes: `[String]` - array of strings for the scopes of the user
    - userId: `String?` - User id of the user, optional
 - return value: `DiscordUser` - returns DiscordUser instance

**note:** if userDetails.userId is not provided, you must call [DiscordUser.setup()](#async%20DiscordUser.setup()) before making any calls.

**example:**
```JS
const user = new DiscordUser({
    accessToken: "ACCESS_TOKEN",
    refreshToken: "REFRESH_TOKEN",
    scopes: ["identify"],
    userId: "123"
});
```
---
## async DiscordUser.setup()
 - return value: `Promise` - won't reject/throw, will return true if successful, false on fail.

This will dynamically assign the userId on the user. You will only need to use this if you didn't provide a userId on instanciating of the DiscordUser.

**example:**
```JS
const success = await user.setup();
```
---
## DiscordUser.addHook(event, hook)
 - event: `String` - event to hook onto, see [DiscordHooks](#DiscordHooks) for all hooks
 - hook: `Function` - function to execute when event fires, see [DiscordHooks](#DiscordHooks) for more info on the hooks
 - return value: `Boolean` - returns `true` if successful, can only fail if you use a nonexistent event

Used for setting up a hook for the specific user.

**note:** If hook is an async function (or returns a promise) it will wait for it to finish until it continues.

**note:** If there is a hook assigned on the user AND globally. only the user one will fire on the event. user hooks have priority.

**example:**
```JS
DiscordUser.addHook(DiscordHooks.tokenUpdate, (userDetails) => {
    console.log(userDetails);
});
```
---
## async DiscordUser.logout()
 - return value: `Promise` - won't reject/throw, will return true if successful, false on fail.

Logs out the user

**note:** You won't be able to use the user anymore after that.

**example:**
```JS
const success = await user.logout();
```

## Other methods
All of the below methods are wrappers around the api. you can access the result by accessing `returnvalue.body`.
Will throw `HttpError` if something goes wrong with the request.

**example:**
```JS
user.getUser().then((res) => {
    console.log(res.body) //=> user object
    console.log(res.body.id) //=> userId
}).catch((err) => {
    console.error(err); //=> HttpError or Error
});
```

### **async DiscordUser.getUser()**
 - return value: `Promise`
    - Resolve: `Response`
    - Reject: `HttpError || Error`

Gets current user info. Needs `identify` scope.

### **async DiscordUser.getUserGuilds()**
 - return value: `Promise`
    - Resolve: `Response`
    - Reject: `HttpError || Error`

Gets current user guilds. Needs `guilds` scope.

# DiscordBot

## new DiscordBot(botToken, userId)
 - botToken: `String` - discord bot token
 - userId: `String?` - Userid of the bot, optional
 - return value: `DiscordBot` - returns DiscordBot instance

**note:** if userId is not provided, you must call [DiscordBot.setup()](#async%20DiscordBot.setup()) before making any calls.

**example:**
```JS
const bot = new DiscordUser("BOT_TOKEN", "123");
```
---
## async DiscordBot.setup()
 - return value: `Promise` - won't reject/throw, will return true if successful, false on fail.

This will dynamically assign the userId on the bot. You will only need to use this if you didn't provide a userId on instanciating of the DiscordBot.

**example:**
```JS
const success = await bot.setup();
```
---
## DiscordBot.addHook(event, hook)
 - event: `String` - event to hook onto, see [DiscordHooks](#DiscordHooks) for all hooks
 - hook: `Function` - function to execute when event fires, see [DiscordHooks](#DiscordHooks) for more info on the hooks
 - return value: `Boolean` - returns `true` if successful, can only fail if you use a nonexistent event

Used for setting up a hook for this specific bot.

**note:** If hook is an async function (or returns a promise) it will wait for it to finish until it continues.

**note:** If there is a hook assigned on the bot AND globally. only the bot one will fire on the event. bot hooks have priority.

## Other methods
All of the below methods are wrappers around the api. you can access the result by accessing `returnvalue.body`.
Will throw `HttpError` if something goes wrong.

**example:**
```JS
user.getBot().then((res) => {
    console.log(res.body) //=> user object
    console.log(res.body.id) //=> userId
}).catch((err) => {
    console.error(err); //=> HttpError or Error
});
```

### **async DiscordBot.getBot()**
 - return value: `Promise`
    - Resolve: `Response`
    - Reject: `HttpError | Error`

Gets current user info

### **async DiscordBot.getGuild(guildId, withCounts)**
 - guildId: `String`
 - withCounts: `Boolean` - if to return with approximate user and presence counts
 - return value: `Promise`
    - Resolve: `Response`
    - Reject: `HttpError | Error`

Gets guild data

### **async DiscordBot.getMember(guildId, memberId)**
 - guildId: `String`
 - memberId: `String`
 - return value: `Promise`
    - Resolve: `Response`
    - Reject: `HttpError | Error`

Gets member data from guild

# DiscordHooks

### **DiscordHooks.tokenUpdate**
triggers when token information gets updated. only for `DiscordUser`

**hook(userDetails)**
 - userDetails: `Object`
    - accessToken: `String` - new access token of the user
    - refreshToken: `String` - new refresh token of user
    - scopes: `[String]` - array of strings for the scopes of the user, stays the same
    - userId: `String` - User id of the user, stays the same

### **DiscordHooks.tokenRevoke**
Triggers when tokens gets revoked. (triggers exclusively on calling `DiscordUser.logout()`). Only for `DiscordUser`

**hook(userId)**
 - userId: `String` - User id of the user that got their tokens revoked
