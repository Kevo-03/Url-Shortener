import { Controller, Get, Post, Body, Param, Query, NotFoundException, BadRequestException, Res, Version, UseGuards } from '@nestjs/common';
import { UrlsService } from '../../url-shortener.service';
import { Response } from 'express';
import { CreateUrlDto } from '../../dto/create-url.dto';
import { ENV_VAR } from '../../../config/app.config';
import { BasicAuthGuard } from '../../auth/auth.guard';

const BASE_URL = ENV_VAR.BASE_URL;

@Controller()
export class UrlsControllerV1 {
    constructor(private urlsService: UrlsService) { }

    @Get(':code')
    async redirect(@Param('code') shortUrl: string, @Res() res: Response) {
        const longUrl = await this.urlsService.resolve(shortUrl);
        if (!longUrl) {
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 Not Found</title>
                    <style>
                        body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f0f2f5; }
                        h1 { font-size: 50px; margin-bottom: 20px; color: #333; }
                        p { font-size: 20px; color: #666; }
                    </style>
                </head>
                <body>
                    <h1>404</h1>
                    <p>Oops! The short URL you are looking for does not exist.</p>
                </body>
                </html>
            `;
            return res.status(404).send(html);
        }
        return res.redirect(301, longUrl);
    }

    @Version('1')
    @Get('lookup')
    async lookup(@Query('url') url: string) {
        if (!url) throw new BadRequestException('url query param required');

        const hit = await this.urlsService.findExisting(url);
        if (!hit) throw new NotFoundException('No short URL for that address');

        return hit;
    }
    @Version('1')
    //@UseGuards(BasicAuthGuard)
    @Post('shorten')
    async shorten(@Body() body: CreateUrlDto) {
        const { code, ttl } = await this.urlsService.shorten(body.url, body.ttl);
        return { shortUrl: `${BASE_URL}/${code}`, shortCode: code, ttl };
    }
}
