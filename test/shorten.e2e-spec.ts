import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ENV_VAR } from '../src/config/app.config';

describe('Shortening System', () => {
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
    });

    it('should return 401 if unauthenticated shortening request is made', async () => {
        return request(app.getHttpServer())
            .post('/v1/shorten')
            .send({ url: 'https://example.com/very/long/path' })
            .expect(401);
    });

    it('should return 401 if credentials are wrong', async () => {
        return request(app.getHttpServer())
            .post('/v1/shorten')
            .auth('wrong', 'wrong')
            .send({ url: 'https://example.com/very/long/path' })
            .expect(401);
    });

    it('should create a short code when authenticated', async () => {
        const res = await request(app.getHttpServer())
            .post('/v1/shorten')
            .auth(USER_NAME!, PASSWORD!)
            .send({ url: 'https://example.com/very/long/path' })
            .expect(201)

        expect(res.body).toHaveProperty('shortCode');
        expect(res.body).toHaveProperty('shortUrl');

        shortCode = res.body.shortCode;
    });

    it('should return 400 for non url input', async () => {
        return request(app.getHttpServer())
            .post('/v1/shorten')
            .auth(USER_NAME!, PASSWORD!)
            .send({ url: 'Hello World' })
            .expect(400)
    });

    it('should return 400 for non string input', async () => {
        return request(app.getHttpServer())
            .post('/v1/shorten')
            .auth(USER_NAME!, PASSWORD!)
            .send({ url: 123 })
            .expect(400)
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
});
