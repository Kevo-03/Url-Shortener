import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

const SHORT_URL_TTL = 60 * 60 * 24 * 30;

@Injectable()
export class UrlsRepository {
    constructor(@InjectRedis() private readonly redis: Redis) { }

    async save(code: string, longUrl: string): Promise<'OK'> {
        return this.redis.set(code, longUrl, 'EX', SHORT_URL_TTL);
    }

    async get(code: string) {
        return this.redis.get(code);
    }

    async exists(code: string) {
        return (await this.redis.exists(code)) === 1;
    }
}