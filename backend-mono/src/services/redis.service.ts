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

  // ---------------------------------------------------------------
  // MED-05 — token store primitives.
  // Unlike getCache (which conflates "missing" and "unavailable"), these
  // distinguish the two so callers can fail OPEN when Redis is down
  // (bounded by the 15-minute access TTL) and fail CLOSED where a lookup
  // is required to prove a token was ever issued (refresh issuance).
  // ---------------------------------------------------------------

  /** Returns current value (0 when the key never existed) or null if Redis is unavailable. */
  async getNumber(key: string): Promise<number | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      const value = await this.client.get(key);
      if (value === null) return 0;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    } catch (error) {
      console.error(`Redis getNumber error for key ${key}:`, error);
      return null;
    }
  }

  /** true/false for present/absent, null if Redis is unavailable. */
  async exists(key: string): Promise<boolean | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      return (await this.client.exists(key)) === 1;
    } catch (error) {
      console.error(`Redis exists error for key ${key}:`, error);
      return null;
    }
  }

  /** Atomic increment (creates the key at 1) or null if Redis is unavailable. */
  async incr(key: string): Promise<number | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`Redis incr error for key ${key}:`, error);
      return null;
    }
  }
}

export const redisService = new RedisService();
