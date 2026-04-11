import { createClient, RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisManager {
  private static instance: RedisClientType | null = null;
  private static connectionPromise: Promise<RedisClientType> | null = null;

  static async getClient(): Promise<RedisClientType> {
    if (this.instance) return this.instance;

    if (!this.connectionPromise) {
      this.connectionPromise = (async () => {
        const client = createClient({
          url: REDIS_URL,
          // Upstash/Heroku/Vercel Redis usually needs TLS
          socket: REDIS_URL.startsWith('rediss://') ? {
            tls: true,
            rejectUnauthorized: false // Common for self-signed/managed certs
          } : undefined
        });

        client.on('error', (err) => console.error('Redis Client Error', err));

        await client.connect();
        this.instance = client as RedisClientType;
        return this.instance;
      })();
    }

    return this.connectionPromise;
  }
}

export const getRedisClient = () => RedisManager.getClient();
