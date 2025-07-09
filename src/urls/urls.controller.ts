import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { UrlsService } from './urls.service';

@Controller('cache')
export class UrlsController {
    constructor(private urlsService: UrlsService) { }

    @Post()
    async write(
        @Body('key') key: string,
        @Body('value') value: string,
        @Body('ttl') ttl?: number, // optional
    ) {
        await this.urlsService.set(key, value, ttl);
        return { ok: true };
    }

    // GET /cache/foo?default=42  → returns stored value or default
    @Get(':key')
    async read(
        @Param('key') key: string,
        @Query('default') fallback?: string,
    ) {
        const val = await this.urlsService.get(key);
        return { value: val ?? fallback ?? null };
    }
}
