import { Module } from '@nestjs/common';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { ShortenController } from './controller/shorten.controller';
import { RedirectController } from './controller/redirect.controller';

@Module({
    controllers: [UrlsController, ShortenController, RedirectController],
    providers: [UrlsService]
})
export class UrlsModule { }
