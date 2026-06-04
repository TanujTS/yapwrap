import IORedis from "ioredis";
import { env } from "./env";

// BullMQ requires an ioredis instance, not a URL string
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ — it manages retries itself
});