// 1. ADD THIS LINE
jest.mock('ioredis', () => require('ioredis-mock'));

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Shortening System', () => {
    let app: INestApplication<App>;
    let shortCodeA: string;
    let shortCodeB: string;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.enableVersioning({ type: VersioningType.URI });
        await app.init();
    });

    // --- DELETED ALL AUTHENTICATION TESTS ---

    it('should create a short code and url with default ttl', async () => {
        const res = await request(app.getHttpServer())
            .post('/v1/shorten')
            // REMOVED .set('Authorization')
            .send({ url: 'https://example.com/very/long/path' })
            .expect(201)

        expect(res.body).toHaveProperty('shortCode');
        expect(res.body).toHaveProperty('shortUrl');
        expect(res.body).toHaveProperty('ttl');
        expect(res.body.ttl).toBe(2592000);
    });

    it('should create a short code and url with custom ttl', async () => {
        const customTTL = 5000;
        const res = await request(app.getHttpServer())
            .post('/v1/shorten')
            // REMOVED .set('Authorization')
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
            // REMOVED .set('Authorization')
            .send({ url: 'Hello World' })
            .expect(400)
    });

    it('should return 400 for non string input', async () => {
        return request(app.getHttpServer())
            .post('/v1/shorten')
            // REMOVED .set('Authorization')
            .send({ url: 123 })
            .expect(400)
    });

    it('GET /v1/lookup returns code with longest TTL', async () => {
        // Create Code A
        const resA = await request(app.getHttpServer())
            .post('/v1/shorten')
            // REMOVED .set('Authorization')
            .send({ url: 'https://example.com/very/long/path2', ttl: 120 })
            .expect(201);
        shortCodeA = resA.body.shortCode;

        // Create Code B
        const resB = await request(app.getHttpServer())
            .post('/v1/shorten')
            // REMOVED .set('Authorization')
            .send({ url: 'https://example.com/very/long/path2', ttl: 600 })
            .expect(201);
        shortCodeB = resB.body.shortCode;

        const resLookup = await request(app.getHttpServer())
            .get('/v1/lookup')
            .query({ url: 'https://example.com/very/long/path2' })
            .expect(200);

        expect(resLookup.body.code).toBe(shortCodeB);
        expect(resLookup.body.ttl).toBeGreaterThan(300);
    });
});