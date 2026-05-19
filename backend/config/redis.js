const Redis = require('ioredis');

// Support both local Redis and cloud Redis (e.g. Upstash)
// If REDIS_URL is set (Upstash provides this), use it directly
// Otherwise fall back to individual host/port/password env vars
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      tls: { rejectUnauthorized: false }
    })
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined
    });

redis.on('connect', () => {
  console.log('Redis Connected');
});

redis.on('error', (err) => {
  console.log('Redis Error:', err.message);
});

module.exports = redis;
