import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

//hem default değer hem env (isteğe göre overwrite)

@Injectable()
export class UrlsRepository {
    constructor(@InjectRedis() private readonly redis: Redis) { }

    async save(code: string, longUrl: string, ttl: number): Promise<'OK'> {
        return this.redis.set(code, longUrl, 'EX', ttl);
    }

    async get(code: string) {
        return this.redis.get(code);
    }

    async exists(code: string) {
        return (await this.redis.exists(code)) === 1;
    }

    async saveIfUnique(code: string, longUrl: string, ttl: number) {
        const ok = await this.redis.set(code, longUrl, 'EX', ttl, 'NX');
        return ok === 'OK';
    }
}