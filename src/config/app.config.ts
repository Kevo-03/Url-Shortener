import * as dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development' });

function toNumber(val: string | undefined, fallback: number): number {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
}

export const ENV_VAR = {
    PORT: process.env.PORT,
    VERSION: process.env.npm_package_version,
    // ───────── Redis ─────────
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_DB: process.env.REDIS_DB,
    REDIS_PASS: process.env.REDIS_PASSWORD,      // may be undefined
    REDIS_TLS: process.env.REDIS_TLS === 'true',
    REDIS_URI: process.env.REDIS_URI,            // [NEW] for Docker/Cloud

    // ───────── App settings ─────────
    DEFAULT_TTL: toNumber(process.env.DEFAULT_TTL, 60 * 60 * 24 * 30),  // 30 days
    BASE_URL: process.env.SHORTENER_PROXY_BASE_URL,
    CODE_LEN: toNumber(process.env.CODE_LEN, 7),
    MAX_ATTEMPTS: toNumber(process.env.MAX_ATTEMPTS, 3),
    BASIC_AUTH_USER: process.env.BASIC_AUTH_USER,
    BASIC_AUTH_PASS: process.env.BASIC_AUTH_PASS,
    BASIC_AUTH: process.env.BASIC_AUTH,
}