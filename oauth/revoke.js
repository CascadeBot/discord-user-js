async function revokeToken(user) {
    console.log("revoke fired", user.accessToken, user.refreshToken);
    return user;
}

module.exports = {
    revokeToken
};
