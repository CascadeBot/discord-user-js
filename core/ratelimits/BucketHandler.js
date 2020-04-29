const { bucketRegister, updateBucketRegister } = require("../data/bucketRegister");
const { startRatelimit } = require("../../helpers/sleep");

class BucketHandler {
    constructor() {
        this.bucket = new Map();
        this.globalRate = {
            active: false,
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
        await rate.queue[0]((headers) => {
            let remaining = headers["x-ratelimit-remaining"];
            let reset = headers["x-ratelimit-reset"];
            if (!remaining) remaining = 1;
            if (!reset) reset = 1;

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
        if (bucketRegister.has(queueItem.id)) {
            this._addToRouterQueue(bucketRegister.get(queueItem.id), queueItem.call);
        } else {
            await queueItem.call((headers) => {
                let remaining = headers["x-ratelimit-remaining"];
                let reset = headers["x-ratelimit-reset"];
                let bucket = headers["x-ratelimit-bucket"];
                if (!remaining) remaining = 1;
                if (!reset) reset = 1;

                bucket = updateBucketRegister(queueItem.id, bucket);
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

    startGlobalRatelimit(milliseconds) {
        this.globalRate.active = new Promise((resolve) => {
            setTimeout(() => {
                this.globalRate.active = false;
                resolve();
            }, milliseconds);
        })
        return this.globalRate.active;
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
        if (bucketRegister.has(endpointId))
            return this._addToRouterQueue(bucketRegister.get(endpointId), call);
        return this._addtoGlobalQueue(call, endpointId);
    }
}

module.exports = {
    BucketHandler
}