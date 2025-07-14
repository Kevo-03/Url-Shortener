import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsRepository } from './repository/urls.repository';
import { UrlsControllerV1 } from './controller/v1/urls.controller';

@Module({
    controllers: [UrlsControllerV1],
    providers: [UrlsService, UrlsRepository]
})
export class UrlsModule { }
