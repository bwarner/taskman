import express from 'express';
import cors from 'cors';
import taskman from './taskman.js';
import logger from './logger.js';
import { Cluster } from 'ioredis';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api', taskman);

app.listen(PORT, async () => {
  const redis = new Cluster(
    [
      { host: 'redis-node-0', port: 6379 },
      { host: 'redis-node-1', port: 6379 },
      { host: 'redis-node-2', port: 6379 },
    ],
    {
      redisOptions: {
        password: process.env.REDIS_PASSWORD,
      },
    },
  );
  await redis.set('task1', 'pending');
  console.log('Cluster says:', await redis.get('task1'));

  logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
