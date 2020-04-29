async function refreshToken(user) {
    console.log(user.accessToken, user.refreshToken);
    return user;
}

module.exports = {
    refreshToken
};
