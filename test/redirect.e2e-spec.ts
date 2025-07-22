import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ENV_VAR } from '../src/config/app.config';

describe('Redirection System', () => {
    let app: INestApplication<App>;
    let shortCode: string;

    const USER_NAME = ENV_VAR.BASIC_AUTH_USER;
    const PASSWORD = ENV_VAR.BASIC_AUTH_PASS;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.enableVersioning({ type: VersioningType.URI });
        await app.init();
        const res = await request(app.getHttpServer())
            .post('/v1/shorten')
            .auth(USER_NAME!, PASSWORD!)
            .send({ url: 'https://example.com/very/long/path' })
            .expect(201)
        shortCode = res.body.data.shortCode;
    });

    it('should redirecs to the original Url mapped to the short Url', async () => {
        const code = shortCode;

        const res = await request(app.getHttpServer())
            .get(`/${code}`)
            .redirects(0)
            .expect(301)

        expect(res.headers.location).toBe('https://example.com/very/long/path',);
    });

    it('should return 404 for non-existing short Url', async () => {
        return request(app.getHttpServer())
            .get('/abcdser')
            .expect(404)
    });

    // timekeeper
    it('expires after ttl seconds', async () => {
        const res = await request(app.getHttpServer())
            .post('/v1/shorten')
            .auth(USER_NAME!, PASSWORD!)
            .send({ url: 'https://example.com/very/long/path', ttl: 2 })
            .expect(201);

        await new Promise(r => setTimeout(r, 3000));

        return request(app.getHttpServer())
            .get(`/${res.body.shortCode}`)
            .expect(404);
    });
});
