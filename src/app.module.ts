import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlsModule } from './url-shortener/url-shortener.module';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_CONNECTION_URL } from './config/redis.config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),

    RedisModule.forRoot({
      //imports: [ConfigModule],
      //inject: [ConfigService],
      //useFactory: (cfg: ConfigService): RedisModuleOptions => ({
      type: 'single',
      url: REDIS_CONNECTION_URL,
    }),
    //}),

    UrlsModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true })
    }],
})
export class AppModule { }
