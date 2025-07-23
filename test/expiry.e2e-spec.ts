jest.mock('ioredis', () => require('ioredis-mock'));

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import * as tk from 'timekeeper';
import { ENV_VAR } from '../src/config/app.config';

const USER = ENV_VAR.BASIC_AUTH_USER!;
const PASS = ENV_VAR.BASIC_AUTH_PASS!;

describe('Redirection TTL (mock Redis)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        jest.useFakeTimers();

        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        app.enableVersioning({ type: VersioningType.URI });
        await app.init();
    });

    afterEach(() => tk.reset());
    afterAll(async () => {
        jest.useRealTimers();
        await app.close();
    });

    it('expires after ttl', async () => {
        const now = new Date('2025-07-23T00:00:00Z');
        tk.freeze(now);

        const { body } = await request(app.getHttpServer())
            .post('/v1/shorten')
            .auth(USER, PASS)
            .send({ url: 'https://example.com/very/long/path', ttl: 2 })
            .expect(201);

        const code = body.data.shortCode;
        const realTtl = body.data.ttl;

        const msToJump = (realTtl + 1) * 1000;
        tk.travel(new Date(now.getTime() + msToJump));
        await jest.advanceTimersByTimeAsync(msToJump);


        await request(app.getHttpServer())
            .get(`/${code}`)
            .expect(404);
    });
});