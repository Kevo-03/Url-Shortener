import { Controller, Get, Post, Body, Param, NotFoundException, Res, Version, UseGuards } from '@nestjs/common';
import { UrlsService } from 'src/urls/urls.service';
import { Response } from 'express';
import { CreateUrlDto } from 'src/urls/dto/create-url.dto';
import { ENV_VAR } from 'src/config/app.config';
import { BasicAuthGuard } from 'src/urls/auth/auth.guard';

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
        const shortCode = await this.urlsService.shorten(body.url, body.ttl);
        return { shortUrl: `${BASE_URL}/${shortCode}`, shortCode };
    }
}
