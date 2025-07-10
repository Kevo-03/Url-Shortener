import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { UrlsRepository } from './urls.repository';

@Injectable()
export class UrlsService {
    constructor(private repo: UrlsRepository) { }

    async set(key: string, value: string): Promise<'OK'> {
        return this.repo.save(key, value);
    }

    /** get a key (or null if missing) */
    async get(key: string): Promise<string | null> {
        return this.repo.get(key);
    }
}
