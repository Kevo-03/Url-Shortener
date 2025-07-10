import { Injectable, Logger } from '@nestjs/common';
import { UrlsRepository } from './repository/urls.repository';
import { nanoid } from 'nanoid'

const CODE_LEN = 7

@Injectable()
export class UrlsService {
    private readonly logger = new Logger(UrlsService.name);
    constructor(private repo: UrlsRepository) { }

    async set(key: string, value: string): Promise<'OK'> {
        return this.repo.save(key, value);
    }

    /** get a key (or null if missing) */
    async get(key: string): Promise<string | null> {
        return this.repo.get(key);
    }

    async shorten(longUrl: string) {
        let shortCode = nanoid(CODE_LEN);

        while (await this.repo.exists(shortCode)) {
            shortCode = nanoid(CODE_LEN);
        }

        await this.repo.save(shortCode, longUrl);
        this.logger.debug(`Mapped ${shortCode} to ${longUrl}`);
        return shortCode;
    }

    async resolve(shortUrl: string) {
        return this.repo.get(shortUrl);
    }
}
