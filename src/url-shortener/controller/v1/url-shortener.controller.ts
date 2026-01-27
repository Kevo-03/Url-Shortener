import { Controller, Get, Post, Body, Param, Query, NotFoundException, BadRequestException, Res, Version } from '@nestjs/common';
import { UrlsService } from '../../url-shortener.service';
import { Response } from 'express';
import { CreateUrlDto } from '../../dto/create-url.dto';
import { ENV_VAR } from '../../../config/app.config';
import * as fs from 'fs';
import * as path from 'path';
// Removed BasicAuthGuard import since we are dismissing auth

const BASE_URL = ENV_VAR.BASE_URL;

@Controller()
export class UrlsControllerV1 {

    private readonly indexHtml: string;
    private readonly notFoundHtml: string;

    constructor(private urlsService: UrlsService) {
        const templateDir = path.join(process.cwd(), 'templates');

        this.indexHtml = fs.readFileSync(path.join(templateDir, 'index.html'), 'utf-8');
        this.notFoundHtml = fs.readFileSync(path.join(templateDir, '404.html'), 'utf-8');
    }

    // 1. New Endpoint: Serves the HTML Form at the root URL (localhost:3000/)
    @Get()
    async index(@Res() res: Response) {
        // Send the pre-loaded HTML
        return res.send(this.indexHtml);
    }
    @Get(':code')
    async redirect(@Param('code') shortUrl: string, @Res() res: Response) {
        const longUrl = await this.urlsService.resolve(shortUrl);
        if (!longUrl) {
            return res.status(404).send(this.notFoundHtml);
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

    // 2. Modified: Removed @UseGuards(BasicAuthGuard)
    @Version('1')
    @Post('shorten')
    async shorten(@Body() body: CreateUrlDto) {
        const { code, ttl } = await this.urlsService.shorten(body.url, body.ttl);
        return { shortUrl: `${BASE_URL}/${code}`, shortCode: code, ttl };
    }
}