import { Module } from '@nestjs/common';
import { UrlsService } from './url-shortener.service';
import { UrlsRepository } from './repository/url-shortener.repository';
import { UrlsControllerV1 } from './controller/v1/url-shortener.controller';

@Module({
    controllers: [UrlsControllerV1],
    providers: [UrlsService, UrlsRepository]
})
export class UrlsModule { }
