import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { UrlsRepository } from './repository/urls.repository';
import { nanoid } from 'nanoid'

const CODE_LEN = 7
const MAX_ATTEMPTS = 3

@Injectable()
export class UrlsService {
    private readonly logger = new Logger(UrlsService.name);
    constructor(private repo: UrlsRepository) { }

    async shorten(longUrl: string) {
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            const code = nanoid(CODE_LEN);
            if (await this.repo.saveIfUnique(code, longUrl)) {
                this.logger.debug(`Mapped ${code} → ${longUrl}`);
                return code;
            }
        }

        throw new ServiceUnavailableException('Failed to generate unique short code');
    }

    async resolve(shortUrl: string) {
        return this.repo.get(shortUrl);
    }
}
