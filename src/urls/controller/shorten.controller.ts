import { Controller } from '@nestjs/common';
import { UrlsService } from '../urls.service';

@Controller('shorten')
export class ShortenController {
    constructor(private urlsService: UrlsService) { }
}
