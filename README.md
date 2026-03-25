# URL Shortener Service

[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

A URL shortening service built with **NestJS** and **Redis**. It allows users to shorten long URLs and redirect using short codes. It offers a **public web interface** for easy use and supports optional expiry.

You can try it out at <https://url-shortener-muph.onrender.com/>, since it is deployed on render.com with free tier it can take 50 seconds to start up at your first request.
## Features

- **Public Web Interface** for easy URL shortening
- Generate short URLs for any valid long URL  
- Retrieve the original URL via redirection  
- Retrieve the short code generated for a specific URL, retrieve the one with the longest ttl if there are more than one.
- Expiry support for mappings  
- Redis-backed storage for fast access  
- API versioning

## Tech Stack

- **Node.js** + **NestJS**  
- **Redis**  
- **TypeScript**  
- **Jest** for testing  


## Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)  
- Redis  
- pnpm or npm  

### Installation

```bash
pnpm install
```

### Create `.env` file

```bash
PORT= # Port the NestJS server will run on

# Redis connection settings
REDIS_HOST= # Hostname or IP of your Redis instance (e.g., localhost)
REDIS_PORT= # Port on which Redis is running (e.g., 6379)
REDIS_DB= # Redis database index (e.g., 0)

SHORTENER_PROXY_BASE_URL= # The base URL used for generating short links (usually your frontend or proxy URL)

DEFAULT_TTL= # Default Time-To-Live (TTL) for shortened URLs in seconds (e.g., 30 days = 2592000)
```
For testing create .env.test file with variables for a separate test redis server. For example if the redis port for your development is 6379 and index is 0, then set test redis port to 6380 and index to 1 or another different value than development.
### Start Redis

#### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

#### Manual Setup

```bash
# for dev
redis-server
# for testing
redis-server --port 6380 --daemonize yes --save "" --appendonly no
# use your testing port if it is different than 6380
```

### Start the server

```bash
pnpm run start:dev
# or
pnpm run start
```


## Running Tests

```bash
pnpm run test:e2e
```

## API Usage

### GET `/`

**Description:** Returns the public HTML form for shortening URLs.

---

### POST `/v1/shorten`

**Description:** Shorten a long URL. Publicly accessible.

**Request Body:**
```json
{
  "url": "https://example.com/very/long/url",
  "ttl": 3600
}
```

**cURL Request:**
```bash
curl -X POST http://localhost:3000/v1/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/very/long/url", "ttl": 3600}'
```

**Response:**
```json
{
    "shortUrl": "http://localhost:3000/nVkTz",
    "shortCode": "nVkTz",
    "ttl": 600
}
```

---

### GET `/:code`

**Description:** Redirects to the original long URL.

**cURL Request:**
```bash
curl -i http://localhost:3000/nXFjJ
```

Responds with `301` redirect or `404 Not Found`.

**Example 301 Response**

```bash
HTTP/1.1 301 Moved Permanently
X-Powered-By: Express
Location: https://example.com/very/long/url
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 67
Date: Thu, 24 Jul 2025 13:18:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Moved Permanently. Redirecting to https://example.com/very/long/url
```

---

### GET `/v1/lookup`

**Description:** Returns the generated short code for the given url, if more than one short code exists in redis returns the one with the longest ttl.

**cURL Request:**
```bash
curl -G http://localhost:3000/v1/lookup \
  --data-urlencode "url=https://example.com/very/long/url"
```

**Response:**
```json
{
   "code": "nXFjJ",
    "ttl": 2834
}
```

## Expiry and Cleanup

- Shortened URLs expire based on TTL (default or custom).  
- Redis handles automatic deletion.  
- If a URL is expired, service responds with `404`.


