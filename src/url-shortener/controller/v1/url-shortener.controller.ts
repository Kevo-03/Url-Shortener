import { Controller, Get, Post, Body, Param, NotFoundException, Res, Version, UseGuards } from '@nestjs/common';
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
            throw new NotFoundException('Short URL not found');
        }
        return res.redirect(301, longUrl);
    }

    //Basic auth, envden al, sadece postu versiyonla 
    @Version('1')
    @UseGuards(BasicAuthGuard)
    @Post('shorten')
    async shorten(@Body() body: CreateUrlDto) {
        const { code, ttl } = await this.urlsService.shorten(body.url, body.ttl);
        return { shortUrl: `${BASE_URL}/${code}`, shortCode: code, ttl };
    }
}
