async function revokeToken(user) {
    console.log(user.accessToken, user.refreshToken);
    return user;
}

module.exports = {
    revokeToken
};
