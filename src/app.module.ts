import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlsModule } from './urls/urls.module';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    // 1. Load env vars globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),

    // 2. Create a single Redis client
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): RedisModuleOptions => ({
        type: 'single',
        // you can use either `url` *or* the lower-level `config` block
        url: `redis://${cfg.get('REDIS_HOST')}:${cfg.get('REDIS_PORT')}/${cfg.get('REDIS_DB')}`,
      }),
    }),

    UrlsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
