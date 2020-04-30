const { endpoints } = require("../core/data/endpoints");
const { makeOauthRequest } = require("../request/oauthRequest");

async function refreshToken(user, context) {
    let newDetails
    try {
        const res = await makeOauthRequest(endpoints.oauthToken, {
            userDetails: user,
            body: {
                grant_type: 'refresh_token',
                refresh_token: user.refreshToken,
                scope: user.scopes.join(" ")
            }
        }, context);
        newDetails = {
            ...user,
            accessToken: res.body.access_token,
            refreshToken: res.body.refresh_token,
            scopes: res.body.scope.split(" ")
        }
    } catch (e) {
        return false;
    }
    return newDetails;
}

module.exports = {
    refreshToken
};
