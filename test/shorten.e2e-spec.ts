import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ENV_VAR } from '../src/config/app.config';

describe('Shortening System', () => {
    let app: INestApplication<App>;

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

    it('throws 401 if unauthenticated shortening request is made', async () => {
        return request(app.getHttpServer())
            .post('/v1/shorten')
            .send({ url: 'https://example.com' })
            .expect(401);
    });

    it('creates a short code when authenticated', async () => {
        const res = await request(app.getHttpServer())
            .post('/v1/shorten')
            .auth(USER_NAME!, PASSWORD!)
            .send({ url: 'https://example.com/foo' })
            .expect(201)

        expect(res.body).toHaveProperty('shortCode');
        expect(res.body).toHaveProperty('shortUrl');
    })
});
