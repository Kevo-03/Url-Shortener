import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { ShortenController } from './controller/shorten.controller';
import { RedirectController } from './controller/redirect.controller';
import { UrlsRepository } from './repository/urls.repository';
import { UrlsControllerV1 } from './controller/v1/urls.controller';

@Module({
    controllers: [ShortenController, RedirectController, UrlsControllerV1],
    providers: [UrlsService, UrlsRepository]
})
export class UrlsModule { }
