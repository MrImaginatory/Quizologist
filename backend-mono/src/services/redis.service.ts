import Redis from "ioredis";
import { env } from "../config/env";

class RedisService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.client) return;

    this.client = new Redis(env.REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on("connect", () => {
      console.log("Redis connected successfully.");
      this.isConnected = true;
    });

    this.client.on("error", (err) => {
      console.error("Redis connection error:", err);
      this.isConnected = false;
    });
  }

  /**
   * Get a value from the cache
   */
  async getCache<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Redis get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in the cache with a TTL (Time To Live) in seconds
   * Default TTL is 300 seconds (5 minutes)
   */
  async setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      console.error(`Redis set error for key ${key}:`, error);
    }
  }

  /**
   * Delete a value from the cache
   */
  async delCache(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Redis del error for key ${key}:`, error);
    }
  }
}

export const redisService = new RedisService();
