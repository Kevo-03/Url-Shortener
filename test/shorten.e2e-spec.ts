import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ENV_VAR } from '../src/config/app.config';

describe('Shortening System', () => {
    let app: INestApplication<App>;
    let shortCodeA: string;
    let shortCodeB: string;

    const AUTH = ENV_VAR.BASIC_AUTH;

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
            .set('Authorization', 'Basic Bad')
            .send({ url: 'https://example.com/very/long/path' })
            .expect(401);
    });

    it('should return 401 if authorization header is not Basic', async () => {
        return request(app.getHttpServer())
            .post('/v1/shorten')
            .set('Authorization', 'Bearer whatever-token')
            .send({ url: 'https://example.com/very/long/path' })
            .expect(401);
    });

    it('should create a short code and url with default ttl when authenticated', async () => {
        const res = await request(app.getHttpServer())
            .post('/v1/shorten')
            .set('Authorization', AUTH!)
            .send({ url: 'https://example.com/very/long/path' })
            .expect(201)

        expect(res.body).toHaveProperty('shortCode');
        expect(res.body).toHaveProperty('shortUrl');
        expect(res.body).toHaveProperty('ttl');
        expect(res.body.ttl).toBe(2592000);
    });

    it('should create a short code and url with custom ttl when authenticated', async () => {
        const customTTL = 5000;
        const res = await request(app.getHttpServer())
            .post('/v1/shorten')
            .set('Authorization', AUTH!)
            .send({ url: 'https://example.com/very/long/path', ttl: customTTL })
            .expect(201)

        expect(res.body).toHaveProperty('shortCode');
        expect(res.body).toHaveProperty('shortUrl');
        expect(res.body).toHaveProperty('ttl');
        expect(res.body.ttl).toBe(customTTL);
    });

    it('should return 400 for non url input', async () => {
        return request(app.getHttpServer())
            .post('/v1/shorten')
            .set('Authorization', AUTH!)
            .send({ url: 'Hello World' })
            .expect(400)
    });

    it('should return 400 for non string input', async () => {
        return request(app.getHttpServer())
            .post('/v1/shorten')
            .set('Authorization', AUTH!)
            .send({ url: 123 })
            .expect(400)
    });

    it('GET /v1/lookup returns code with longest TTL', async () => {
        const resA = await request(app.getHttpServer())
            .post('/v1/shorten')
            .set('Authorization', AUTH!)
            .send({ url: 'https://example.com/very/long/path2', ttl: 120 })
            .expect(201);
        shortCodeA = resA.body.shortCode;

        const resB = await request(app.getHttpServer())
            .post('/v1/shorten')
            .set('Authorization', AUTH!)
            .send({ url: 'https://example.com/very/long/path2', ttl: 600 })
            .expect(201);
        shortCodeB = resB.body.shortCode;
        console.log(shortCodeA);
        console.log(shortCodeB);

        const resLookup = await request(app.getHttpServer())
            .get('/v1/lookup')
            .query({ url: 'https://example.com/very/long/path2' })
            .expect(200);

        expect(resLookup.body.code).toBe(shortCodeB);
        expect(resLookup.body.ttl).toBeGreaterThan(300);
    });

});
