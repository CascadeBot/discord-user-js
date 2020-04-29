const { errIdGenFailed } = require("./errors");

const bucketRegister = new Map();

function jenerateBucket(depth) {
    if (!depth) depth = 0;
    if (depth > 20) throw errIdGenFailed;
    const random = "---" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    const values = bucketRegister.values();
    for (let val of values) {
        if (random == val)
            return jenerateBucket(depth + 1);
    }
    return random;
}

function updateBucketRegister(endpointId, bucketId) {
    if (!bucketId) {
        bucketId = jenerateBucket();
        if (!bucketRegister.has(endpointId)) {
            bucketRegister.set(endpointId, bucketId);
            return bucketId;
        }
        return bucketRegister.get(endpointId);
    }
    bucketRegister.set(endpointId, bucketId);
    return bucketId;
}

module.exports = {
    bucketRegister,
    updateBucketRegister
};
