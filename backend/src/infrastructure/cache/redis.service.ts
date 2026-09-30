import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
// @ts-ignore
import RedisMock from 'ioredis-mock';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  onModuleInit() {
    if (process.env.REDIS_URL === 'mock') {
      this.redisClient = new RedisMock() as any;
    } else {
      this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  async setCache(key: string, value: any, ttlSeconds: number) {
    await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async getCache<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  getClient(): Redis {
    return this.redisClient;
  }
}
