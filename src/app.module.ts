import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlsModule } from './url-shortener/url-shortener.module';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_CONNECTION_URL } from './config/redis.config';
import { TNestHelpers } from '@token-org/token-x-common-util';


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
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        skipMissingProperties: false,
        transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
        whitelist: true, // Strip properties not existing in the DTO
        forbidNonWhitelisted: true, // Throw errors if non-whitelisted values are provided
        stopAtFirstError: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: TNestHelpers.Filters.GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TNestHelpers.Interceptors.GlobalResponseInterceptor,
    },
    AppService,
  ],
})

export class AppModule { }
