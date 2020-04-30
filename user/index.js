const req = require("../core");
const { endpoints } = require("../core/data/endpoints");
const { refreshToken } = require("../oauth/refresh");
const { revokeToken } = require("../oauth/revoke");

const scopeList = {
    identify: "identify"
};

class DiscordUser {
    constructor({accessToken, refreshToken, scopes}, userId) {
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
            const hookRes = context.refreshHook(this.details);
            if (hookRes instanceof Promise) {
                try {
                    await hookRes;
                } catch (e) {}
            }
        }
        return this.details;
    }

    async logout() {
        let success;
        try {
            success = await revokeToken(this.details);
        } catch (e) {
            return false;
        }
        if (!success)
            return false;
        this.details.accessToken = null;
        this.details.refreshToken = null;
        this.active = false;
        if (this.revokeHook) {
            hookRes = this.revokeHook(this.details);
            if (hookRes instanceof Promise) {
                await hookRes;
            }
        }
    }

    getUser() {
        if (!this.active)
            return false;
        if (!this.details.scopes.includes(scopeList.identify))
            return false;
        return req.request(endpoints.userMe, this.details.userId, {}, this._makeContext());
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
};

module.exports = {
    DiscordUser
};
