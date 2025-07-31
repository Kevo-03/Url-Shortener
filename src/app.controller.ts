import { Controller, Get } from '@nestjs/common';
import { ENV_VAR } from './config/app.config';

@Controller({
  version: '1',
})
export class AppController {
  @Get('version')
  getVersion(): { version: string } {
    return {
      version: ENV_VAR.VERSION!,
    };
  }
}

