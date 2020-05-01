function getRatelimitUsers(discordCore) {
    const users = [];
    const keys = discordCore.ratelimits.bucket.keys();
    for (let val of keys) {
        users.push(val);
    }
    return users;
}

module.exports = {
    getRatelimitUsers
};
