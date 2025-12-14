import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

export class RedisService {
  private static client: RedisClientType | null = null;
  private static isConnected = false;

  /**
   * Connect to Redis server
   */
  static async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return false;
            }
            return Math.min(retries * 50, 1000);
          }
        }
      });

      // Event handlers
      this.client.on('error', (error) => {
        logger.error('Redis client error:', error);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connecting...');
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        logger.warn('Redis client connection ended');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis client reconnecting...');
      });

      // Connect to Redis
      await this.client.connect();
      
      // Test the connection
      await this.client.ping();
      
      this.isConnected = true;
      logger.info('Successfully connected to Redis');

    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  static async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        this.client = null;
        this.isConnected = false;
        logger.info('Disconnected from Redis');
      } catch (error) {
        logger.error('Error disconnecting from Redis:', error);
      }
    }
  }

  /**
   * Check if Redis is connected
   */
  static isRedisConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get a value from Redis
   */
  static async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot get key:', key);
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      logger.error(`Failed to get key ${key} from Redis:`, error);
      return null;
    }
  }

  /**
   * Set a value in Redis
   */
  static async set(key: string, value: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot set key:', key);
      return false;
    }

    try {
      await this.client.set(key, value);
      return true;
    } catch (error) {
      logger.error(`Failed to set key ${key} in Redis:`, error);
      return false;
    }
  }

  /**
   * Set a value with TTL (time to live) in Redis
   */
  static async setWithTTL(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot set key with TTL:', key);
      return false;
    }

    try {
      await this.client.setEx(key, ttlSeconds, value);
      return true;
    } catch (error) {
      logger.error(`Failed to set key ${key} with TTL in Redis:`, error);
      return false;
    }
  }

  /**
   * Delete a key from Redis
   */
  static async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot delete key:', key);
      return false;
    }

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Failed to delete key ${key} from Redis:`, error);
      return false;
    }
  }

  /**
   * Check if a key exists in Redis
   */
  static async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot check key existence:', key);
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      logger.error(`Failed to check key ${key} existence in Redis:`, error);
      return false;
    }
  }

  /**
   * Get TTL (time to live) for a key
   */
  static async ttl(key: string): Promise<number | null> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot get TTL for key:', key);
      return null;
    }

    try {
      const ttl = await this.client.ttl(key);
      return ttl;
    } catch (error) {
      logger.error(`Failed to get TTL for key ${key} from Redis:`, error);
      return null;
    }
  }

  /**
   * Increment a numeric value in Redis
   */
  static async incr(key: string): Promise<number | null> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot increment key:', key);
      return null;
    }

    try {
      const result = await this.client.incr(key);
      return result;
    } catch (error) {
      logger.error(`Failed to increment key ${key} in Redis:`, error);
      return null;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  static async keys(pattern: string): Promise<string[]> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot get keys with pattern:', pattern);
      return [];
    }

    try {
      const keys = await this.client.keys(pattern);
      return keys;
    } catch (error) {
      logger.error(`Failed to get keys with pattern ${pattern} from Redis:`, error);
      return [];
    }
  }

  /**
   * Add item to a list
   */
  static async lpush(key: string, value: string): Promise<number | null> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot push to list:', key);
      return null;
    }

    try {
      const result = await this.client.lPush(key, value);
      return result;
    } catch (error) {
      logger.error(`Failed to push to list ${key} in Redis:`, error);
      return null;
    }
  }

  /**
   * Get list items
   */
  static async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot get list range:', key);
      return [];
    }

    try {
      const result = await this.client.lRange(key, start, stop);
      return result;
    } catch (error) {
      logger.error(`Failed to get list range for ${key} from Redis:`, error);
      return [];
    }
  }

  /**
   * Set expiration time for a key
   */
  static async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot set expiration for key:', key);
      return false;
    }

    try {
      const result = await this.client.expire(key, seconds);
      return result;
    } catch (error) {
      logger.error(`Failed to set expiration for key ${key} in Redis:`, error);
      return false;
    }
  }

  /**
   * Add to sorted set
   */
  static async zadd(key: string, score: number, member: string): Promise<number | null> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot add to sorted set:', key);
      return null;
    }

    try {
      const result = await this.client.zAdd(key, { score, value: member });
      return result;
    } catch (error) {
      logger.error(`Failed to add to sorted set ${key} in Redis:`, error);
      return null;
    }
  }

  /**
   * Get sorted set range
   */
  static async zrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot get sorted set range:', key);
      return [];
    }

    try {
      const result = await this.client.zRange(key, start, stop);
      return result;
    } catch (error) {
      logger.error(`Failed to get sorted set range for ${key} from Redis:`, error);
      return [];
    }
  }

  /**
   * Clear cache by pattern
   */
  static async clearCachePattern(pattern: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot clear cache pattern:', pattern);
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client.del(keys);
      logger.info(`Cleared ${result} keys matching pattern: ${pattern}`);
      return result;
    } catch (error) {
      logger.error(`Failed to clear cache pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Get Redis info
   */
  static async info(): Promise<string | null> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, cannot get info');
      return null;
    }

    try {
      const info = await this.client.info();
      return info;
    } catch (error) {
      logger.error('Failed to get Redis info:', error);
      return null;
    }
  }

  /**
   * Health check for Redis
   */
  static async healthCheck(): Promise<{ status: string; latency?: number; error?: string }> {
    if (!this.isConnected || !this.client) {
      return { status: 'disconnected', error: 'Redis not connected' };
    }

    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;
      
      return { status: 'healthy', latency };
    } catch (error) {
      return { status: 'error', error: String(error) };
    }
  }
}