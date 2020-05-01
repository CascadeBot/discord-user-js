const req = require("../core");
const { endpoints } = require("../core/data/endpoints");
const { makeOauthRequest } = require("../request/oauthRequest");
const { refreshToken } = require("../oauth/refresh");
const { revokeToken } = require("../oauth/revoke");

const scopeList = {
    identify: "identify",
    guilds: "guilds"
};

class DiscordUser {

    /* SETUP */
    constructor({accessToken, refreshToken, scopes, userId}) {
        this.active = true;
        this.details = {
            accessToken,
            refreshToken,
            scopes,
            userId: null
        }
        if (userId) this.details.userId = userId;
        this.refreshHook = null;
        this.revokeHook = null;
    }

    _makeHooks() {
        const out = {};
        if (this.refreshHook) out.refreshHook = this.refreshHook;
        if (this.revokeHook) out.revokeHook = this.revokeHook;
        return out;
    }

    _makeContext() {
        return {
            userType: "user",
            user: this,
            ...this._makeHooks()
        };
    }

    _getDetails() {
        return this.details;
    }

    async _updateTokens(context) {
        try {
            const newDetails = await refreshToken(this.details, context);
            if (newDetails)
                this.details = newDetails
            else
                throw newDetails;
        } catch (e) {
            return false;
        }
        if (context.refreshHook) {
            try {
                const hookRes = context.refreshHook(this.details);
                if (hookRes instanceof Promise) {
                        await hookRes;
                }
            } catch (e) {
                return false;
            }
        }
        return this.details;
    }

    _validateInput(scopes) {
        if (!this.active)
            return false;
        if (!this.details.userId)
            return false;
        for (let scope of scopes) {
            if (!this.details.scopes.includes(scope))
                return false;
        }
        return true;
    }

    /* root functions */
    async setup() {
        try {
            const res = await makeOauthRequest(endpoints.userMe, {}, this._makeContext());
            this.details.userId = res.body.id;
            return true;
        } catch (e) {
            return false;
        }
    }

    async logout() {
        if (!this._validateInput([]))
            return false;
        try {
            const success = await revokeToken(this.details, {
                ...this._makeContext(),
                credentials: req.credentials
            });
            if (!success)
                return false;
        } catch (e) {
            return false;
        }
        this.details.accessToken = null;
        this.details.refreshToken = null;
        this.active = false;
        if (this.revokeHook) {
            try {
                hookRes = this.revokeHook(this.details.userId);
                if (hookRes instanceof Promise) {
                    await hookRes;
                }
            } catch (e) {
                return false;
            }
        }
        return true;
    }

    addHook(event, hook) {
        if (event === "token-update") {
            this.refreshHook = hook;
            return true;
        }
        else if (event === "token-revoke") {
            this.revokeHook = hook;
            return true;
        }
        return false;
    }

    /* endpoints */
    getUser() {
        if (!this._validateInput([scopeList.identify])) return false;
        return req.request(endpoints.userMe, this.details.userId, {}, this._makeContext());
    }

    getUserGuilds() {
        if (!this._validateInput([scopeList.identify, scopeList.guilds])) return false;
        return req.request(endpoints.userGuilds, this.details.userId, {}, this._makeContext());
    }
}

module.exports = {
    DiscordUser
};
