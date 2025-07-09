import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class UrlsService {
    constructor(@InjectRedis() private readonly redis: Redis) { }

    async set(key: string, value: string, ttl = 60): Promise<'OK'> {
        // EX = seconds; PX = ms
        return this.redis.set(key, value, 'EX', ttl);
    }

    /** get a key (or null if missing) */
    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }
}
