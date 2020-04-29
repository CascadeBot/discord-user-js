const { BucketHandler } = require("./BucketHandler");

class Ratelimits {
    constructor() {
        this.bucket = new Map();
        this.global = false;
    }

    _getOrCreate(userId) {
        const value = this.bucket.get(userId);
        if (typeof value === "undefined") {
            const newMap = new BucketHandler();
            this.bucket.set(userId, newMap);
            return this.bucket.get(userId);
        }
        return value;
    }

    get(userId) {
        return this._getOrCreate(userId);
    }
}

module.exports = {
    Ratelimits
};
