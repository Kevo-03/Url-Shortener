import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { UrlsRepository } from './repository/url-shortener.repository';
import { nanoid } from 'nanoid'
import { ENV_VAR } from '../config/app.config';

const CODE_LEN = ENV_VAR.CODE_LEN;
const MAX_ATTEMPTS = ENV_VAR.MAX_ATTEMPTS;
const DEFAULT_TTL = ENV_VAR.DEFAULT_TTL;

@Injectable()
export class UrlsService {
    private readonly logger = new Logger(UrlsService.name);
    constructor(private repo: UrlsRepository) { }

    async shorten(longUrl: string, ttl = DEFAULT_TTL) {
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            const code = nanoid(CODE_LEN);
            if (await this.repo.saveIfUnique(code, longUrl, ttl)) {
                this.logger.debug(`Mapped ${code} (${ttl}s) → ${longUrl}`);
                return { code, ttl };
            }
        }

        throw new ServiceUnavailableException('Failed to generate unique short code');
    }

    async resolve(shortUrl: string) {
        return this.repo.get(shortUrl);
    }
}
