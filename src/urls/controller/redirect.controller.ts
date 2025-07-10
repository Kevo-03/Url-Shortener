import { Controller, Get, Param } from '@nestjs/common';
import { UrlsService } from '../urls.service';
import { Response } from 'express';

@Controller()
export class RedirectController {
    constructor(private urlsService: UrlsService) { }

    @Get(':code')
    async redirect(@Param('code') code: string) {

    }
}
