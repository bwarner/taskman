import express from 'express';
import cors from 'cors';
import taskman from './taskman.js';
import logger from './logger.js';
import Redis, { Cluster } from 'ioredis';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.send('OK');
});

app.use('/api', taskman);

app.listen(PORT, async () => {
  const redisNodes = process.env.REDIS_NODES?.split(',');
  let redis;
  if (!process.env.REDIS_NODES) {
    redis = new Redis.default({
      host: 'localhost',
      port: 6379,
      password: process.env.REDIS_PASSWORD,
    });
  } else {
    redis = new Cluster(
      redisNodes?.map((node) => {
        const [host, port] = node.split(':');
        return { host, port: parseInt(port) };
      }) ?? [{ host: 'localhost', port: 6379 }],
      {
        redisOptions: {
          password: process.env.REDIS_PASSWORD,
        },
      },
    );
  }
  console.log('Cluster says:', await redis.get('task1'));

  logger.info(`🚀 Server running at XXXXXX http://localhost:${PORT}`);
});
