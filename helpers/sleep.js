function sleep(timeMilliseconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, timeMilliseconds);
    });
}

async function startRatelimit(rate) {
    if (rate.remaining <= 0) {
        const timeout = rate.reset - Math.round(new Date().getTime() / 1000);
        if (timeout > 0) {
            await sleep(timeout * 1000);
        }
    }
}

module.exports = {
    sleep,
    startRatelimit
};
