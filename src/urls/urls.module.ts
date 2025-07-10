import { Module } from '@nestjs/common';
import { UrlsController } from './controller/urls.controller';
import { UrlsService } from './urls.service';
import { ShortenController } from './controller/shorten.controller';
import { RedirectController } from './controller/redirect.controller';
import { UrlsRepository } from './repository/urls.repository';

@Module({
    controllers: [UrlsController, ShortenController, RedirectController],
    providers: [UrlsService, UrlsRepository]
})
export class UrlsModule { }
