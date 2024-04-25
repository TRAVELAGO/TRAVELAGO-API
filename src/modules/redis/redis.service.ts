import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RedisClient } from 'redis';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisCache } from '@interfaces/redis-store.interface';

@Injectable()
export class RedisService {
  private redisClient: RedisClient;
  constructor(@Inject(CACHE_MANAGER) private cacheManager: RedisCache) {
    this.redisClient = this.cacheManager.store.getClient();
  }

  async SADD(key: string, arg1: string | string[]): Promise<number> {
    return new Promise<number>((resolve) => {
      this.redisClient.SADD(key, arg1, (err, reply) => {
        if (err) {
          console.error(err);
          throw new BadRequestException();
        }
        resolve(reply);
      });
    });
  }

  async SISMEMBER(key: string, member: string): Promise<boolean> {
    const reply = await new Promise<number>((resolve) => {
      this.redisClient.SISMEMBER(key, member, (err, reply) => {
        if (err) {
          console.error(err);
          throw new BadRequestException();
        }
        resolve(reply);
      });
    });

    return reply !== 0;
  }

  async hSet(key: string, field: string, value: string): Promise<number> {
    return new Promise<number>((resolve) => {
      this.redisClient.HSET(key, field, value, (err, reply) => {
        if (err) {
          console.error(err);
          throw new BadRequestException();
        }
        resolve(reply);
      });
    });
  }

  async hGetAll(key: string): Promise<{ [key: string]: string }> {
    return new Promise<{ [key: string]: string }>((resolve) => {
      this.redisClient.HGETALL(key, (err, reply) => {
        if (err) {
          console.error(err);
          throw new BadRequestException();
        }
        resolve(reply);
      });
    });
  }

  async hDel(...args: string[]): Promise<number> {
    return new Promise<number>((resolve) => {
      this.redisClient.HDEL(...args, (err, reply) => {
        if (err) {
          console.error(err);
        } else {
          resolve(reply);
        }
      });
    });
  }
}
