const { endpoints } = require("../core/data/endpoints");
const { makeOauthRequest } = require("../request/oauthRequest");

async function revokeToken(user, context) {
    try {
        const res = await makeOauthRequest(endpoints.oauthRevoke, {
            userDetails: user,
            body: {
                token: user.refreshToken
            }
        }, context);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = {
    revokeToken
};
