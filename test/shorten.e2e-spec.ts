import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ENV_VAR } from '../src/config/app.config';

describe('Shortening System', () => {
    let app: INestApplication<App>;
    let shortCode: string;
    let shortCodeA: string;
    let shortCodeB: string;

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
            .auth(USER_NAME!, PASSWORD!)
            .send({ url: 'https://example.com/very/long/path' })
            .expect(201)

        expect(res.body.data).toHaveProperty('shortCode');
        expect(res.body.data).toHaveProperty('shortUrl');
        expect(res.body.data).toHaveProperty('ttl');
        expect(res.body.data.ttl).toBe(2592000);

        shortCode = res.body.data.shortCode;
    });

    it('should create a short code and url with custom ttl when authenticated', async () => {
        const customTTL = 5000;
        const res = await request(app.getHttpServer())
            .post('/v1/shorten')
            .auth(USER_NAME!, PASSWORD!)
            .send({ url: 'https://example.com/very/long/path', ttl: customTTL })
            .expect(201)

        expect(res.body.data).toHaveProperty('shortCode');
        expect(res.body.data).toHaveProperty('shortUrl');
        expect(res.body.data).toHaveProperty('ttl');
        expect(res.body.data.ttl).toBe(customTTL);

        shortCode = res.body.data.shortCode;
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

    it('GET /v1/lookup returns code with longest TTL', async () => {
        /* 1. create two mappings for the same longUrl with different TTLs */
        const resA = await request(app.getHttpServer())
            .post('/v1/shorten')
            .auth(USER_NAME!, PASSWORD!)
            .send({ url: 'https://example.com/very/long/path2', ttl: 120 })      // 2 min
            .expect(201);
        shortCodeA = resA.body.data.shortCode;

        const resB = await request(app.getHttpServer())
            .post('/v1/shorten')
            .auth(USER_NAME!, PASSWORD!)
            .send({ url: 'https://example.com/very/long/path2', ttl: 600 })      // 10 min
            .expect(201);
        shortCodeB = resB.body.data.shortCode;
        console.log(shortCodeA);
        console.log(shortCodeB);

        /* 2. lookup should return B because it lives longer */
        const resLookup = await request(app.getHttpServer())
            .get('/v1/lookup')
            .query({ url: 'https://example.com/very/long/path2' })
            .expect(200);

        expect(resLookup.body.data.code).toBe(shortCodeB);
        expect(resLookup.body.data.ttl).toBeGreaterThan(300);  // sanity
    });

    /*  it('should redirecs to the original Url mapped to the short Url', async () => {
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
     }); */
});
