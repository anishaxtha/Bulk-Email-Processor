const Queue = require("bull");
const Redis = require("redis");

// Create Redis client
const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// Create email queue
const emailQueue = new Queue("email-queue", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Log queue events for monitoring
emailQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

module.exports = {
  emailQueue,
  redisClient,
};
