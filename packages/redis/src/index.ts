import Redis from "ioredis";

if (!process.env.REDIS_HOST) {
  throw new Error("Missing REDIS_HOST");
}

if (!process.env.REDIS_PORT) {
  throw new Error("Missing REDIS_PORT");
}

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  lazyConnect: true,
  maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
  console.error("[Redis Error]", err);
});

export default redis;
