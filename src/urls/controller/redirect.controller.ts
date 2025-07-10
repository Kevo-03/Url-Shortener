import { Controller } from '@nestjs/common';
import { UrlsService } from '../urls.service';

@Controller()
export class RedirectController {
    constructor(private urlsService: UrlsService) { }
}
