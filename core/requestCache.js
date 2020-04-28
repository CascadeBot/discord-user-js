const { bucketReg, jenerateBucket } = require("./request");

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

class RequestBucket {
    constructor() {
        this.bucket = new Map();
        this.globalRate = {
            // TODO add global ratelimit blocking
            global: true,
            active: false,
            reset: 0,
            remaining: 0,
            queue: []
        };
    }

    getRate(bucketId) {
        const value = this.bucket.get(bucketId);
        if (typeof value === "undefined") {
            const newObject = {
                remaining: 0,
                reset: 0,
                queue: []
            };
            this.bucket.set(bucketId, newObject);
            return this.bucket.get(bucketId);
        }
        return value;
    }

    has(bucketId) {
        return this.bucket.has(bucketId);
    }

    set(bucketId, remaining, reset) {
        if (!bucketId)
            return
        const rate = this.getRate(bucketId);
        rate.remaining = remaining;
        rate.reset = reset;
    }

    async executeQueue(rate, bucketId) {
        const self = this;
        if (rate.queue.length <= 0)
            return
        await rate.queue[0]((remaining, reset) => {
            self.set(bucketId, remaining, reset);
        });
        await startRatelimit(rate);
        rate.queue.shift();
        if (rate.queue.length > 0)
            await this.executeQueue(rate, bucketId);
    }

    async executeGlobalQueue(rate) {
        const self = this;
        if (rate.queue.length <= 0)
            return
        const queueItem = rate.queue[0];
        if (bucketReg.has(queueItem.id)) {
            this._addToRouterQueue(bucketReg.get(queueItem.id), queueItem.call);
        } else {
            await queueItem.call((headers) => {
                let remaining = headers["x-ratelimit-remaining"];
                let reset = headers["x-ratelimit-reset"];
                let bucket = headers["x-ratelimit-bucket"];
                if (!bucket) bucket = jenerateBucket();
                if (!remaining) remaining = 1;
                if (!reset) remaining = 1;

                if (!bucketReg.has(queueItem.id)) {
                    bucketReg.set(queueItem.id, bucket);
                }
                self.set(bucket, remaining, reset);
            });
        }
        rate.queue.shift();
        if (rate.queue.length > 0)
            await this.executeGlobalQueue(rate);
    }

    startGlobalQueue() {
        this.executeGlobalQueue(this.globalRate);
    }

    _addToRouterQueue(bucketId, call) {
        const rate = this.getRate(bucketId);
        const isFirst = rate.queue.length <= 0;
        rate.queue.push(call);
        if (isFirst) {
            this.executeQueue(rate, bucketId);
        }
    }

    _addtoGlobalQueue(call, endpointId) {
        const isFirst = this.globalRate.queue.length <= 0;
        this.globalRate.queue.push({
            call: call,
            id: endpointId
        });
        if (isFirst) {
            this.startGlobalQueue();
        }
    }

    addToQueue(endpointId, call) {
        if (bucketReg.has(endpointId))
            return this._addToRouterQueue(bucketReg.get(endpointId), call);
        return this._addtoGlobalQueue(call, endpointId);
    }
}

class Ratelimits {
    constructor() {
        this.bucket = new Map();
        this.global = false;
    }

    getBucket(userId) {
        const value = this.bucket.get(userId);
        if (typeof value === "undefined") {
            const newMap = new RequestBucket();
            this.bucket.set(userId, newMap);
            return this.bucket.get(userId);
        }
        return value;
    }

    get(userId) {
        return this.getBucket(userId);
    }
}

module.exports = {
    Ratelimits
};
