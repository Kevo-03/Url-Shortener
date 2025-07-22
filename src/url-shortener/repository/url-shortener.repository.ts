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
        const setRes = await this.redis.set(
            `short:${code}`, longUrl, 'EX', ttl, 'NX'
        );
        if (setRes !== 'OK') return false;
        const pipe = this.redis.multi();
        pipe.sadd(`reverse:${longUrl}`, code);
        pipe.expire(`reverse:${longUrl}`, ttl);
        await pipe.exec();
        return true;
    }

    async findBestCode(longUrl: string) {
        const codes = await this.redis.smembers(`reverse:${longUrl}`);
        if (codes.length === 0) return null;

        const pipe = this.redis.multi();
        codes.forEach(c => pipe.ttl(`short:${c}`));

        const replies = await pipe.exec();
        if (!replies) return null;

        let best: { code: string; ttl: number } | null = null;

        for (let i = 0; i < codes.length; i++) {
            const ttl = replies[i][1] as number;
            if (ttl <= 0) {
                await this.redis.srem(`reverse:${longUrl}`, codes[i]);
                continue;
            }
            if (!best || ttl > best.ttl) best = { code: codes[i], ttl };
        }
        return best;
    }
}