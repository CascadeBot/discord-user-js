const req = require("../core");
const { endpoints } = require("../core/data/request");

const scopeList = {
    identify: "identify"
};

class DiscordUser {
    constructor(accessToken, refreshToken, scopes, userId) {
        this.active = true;
        this.details = {
            accessToken,
            refreshToken,
            userId: null
        }
        this.scopes = scopes;
        if (userId) this.details.userId = userId;
    }

    _makeContext() {
        return {
            updatetokens: this._updateTokens
        };
    }

    _updateTokens() {
        console.log("Getting new access token");
        this.details.accessToken = "oof";
        this.details.refreshToken = "moreoof";
        return this.details;
    }

    logout() {
        console.log("Revoking tokens");
        this.active = false;
    }

    getUser() {
        if (!this.active)
            return false;
        if (!this.scopes.includes(scopeList.identify))
            return false;
        return req.request(endpoints.userMe, this.details.userId, {
            userDetails: this.details
        }, this._makeContext());
    }
};

module.exports = {
    DiscordUser
};
