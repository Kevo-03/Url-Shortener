# 📦 URL Shortener Service

A simple URL shortening service built with **NestJS** and **Redis**. It allows users to shorten long URLs and redirect using short codes. It also supports optional expiry and basic authentication.

## 🚀 Features

- Generate short URLs for any valid long URL  
- Retrieve the original URL via redirection  
- Retrieve the short code generated for a specific URL, retrieve the one with the longest ttl if there are more than one.
- Expiry support for mappings  
- Basic Authentication for protected endpoints  
- Redis-backed storage for fast access  
- API versioning

## ⚙️ Tech Stack

- **Node.js** + **NestJS**  
- **Redis**  
- **TypeScript**  
- **Jest** for testing  


## 🔧 Setup Instructions

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

# Basic authentication header value for protecting certain endpoints.
BASIC_AUTH= # Format: "Basic base64(username:password)"   
```
For testing create .env.test file with variables for a separate test redis server. For example if the redis port for your development is 6379 and index is 0, then set test redis port to 6380 and index to 1 or another different value than development.
### Start Redis

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


## 🧪 Running Tests

```bash
pnpm run test:e2e
```

## 📡 API Usage

### 🔐 Authentication

Post shorten endpoint is protected using basic auth. Use the `.env` values as credentials.

### POST `/v1/shorten`

**Description:** Shorten a long URL.

**Headers:**
```
Authorization: Basic <base64encoded-username:password>
```

**cURL Request:**
```bash
curl -X POST http://localhost:3000/v1/shorten \
  -u username:password \
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

## 🗑 Expiry and Cleanup

- Shortened URLs expire based on TTL (default or custom).  
- Redis handles automatic deletion.  
- If a URL is expired, service responds with `404`.


## 🛡️ Security Notes

- Protect API with `.env`-defined Basic Auth  
- Only authenticated users can shorten URLs  
- Redirection is open to all (public access)

