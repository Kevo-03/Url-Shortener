import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { UrlsService } from '../urls.service';
import { Response } from 'express';

@Controller()
export class RedirectController {
    constructor(private urlsService: UrlsService) { }

    @Get(':code')
    async redirect(@Param('code') shortUrl: string, @Res() res: Response) {
        const longUrl = await this.urlsService.resolve(shortUrl);
        if (!longUrl) {
            throw new NotFoundException('Short URL not found');
        }
        return res.redirect(301, longUrl);
    }
}
