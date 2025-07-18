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
        await this.redis.sadd(`reverse:${longUrl}`, code);
        return true;
    }

    async findBestCode(longUrl: string) {
        const codes = await this.redis.smembers(`reverse:${longUrl}`);
        if (codes.length === 0) return null;

        const pipe = this.redis.multi();
        codes.forEach(c => pipe.ttl(`short:${c}`));

        const replies = await pipe.exec();
        if (!replies) return null;

        const ttls = replies.map(r => r[1] as number);

        let best = 0;
        for (let i = 1; i < codes.length; i++) {
            const cur = ttls[i] < 0 ? Number.MIN_SAFE_INTEGER : ttls[i];
            const bestVal = ttls[best] < 0 ? Number.MIN_SAFE_INTEGER : ttls[best];
            if (cur > bestVal) best = i;
        }
        return { code: codes[best], ttl: ttls[best] };
    }
}