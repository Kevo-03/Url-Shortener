import { Controller, Post, Get, Body } from '@nestjs/common';
import { UrlsService } from '../urls.service';
import { CreateUrlDto } from '../dto/create-url.dto';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

@Controller('shorten')
export class ShortenController {
    constructor(private urlsService: UrlsService) { }

    @Post()
    async shorten(@Body() body: CreateUrlDto) {
        const shortCode = await this.urlsService.shorten(body.url);
        return { shortUrl: `${BASE_URL}/${shortCode}`, shortCode };
    }
}
