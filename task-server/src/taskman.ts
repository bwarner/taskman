import express, { Request, Response, NextFunction } from 'express';
import { Cluster } from 'ioredis';
import { createTaskInputSchema, updateTaskInputSchema } from './lib/types.js';
import validate from './validate.js';
import logger from './logger.js';

const redisNodes = process.env.REDIS_NODES?.split(',');

const redis = new Cluster(
  redisNodes?.map((node) => ({ host: node, port: 6379 })) || [],
  {
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
    },
  },
);

redis.on('connect', () => {
  logger.info('Connected to Redis');
  redis;
});

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

const router = express.Router();

router.post(
  '/tasks',
  validate(createTaskInputSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const task = req.body;
    res.json(task);
    next();
  },
);

router.put(
  '/tasks/:id',
  validate(updateTaskInputSchema),
  (req: Request, res: Response) => {
    const task = req.body;
    res.json(task);
  },
);

router.get('/tasks', (req: Request, res: Response) => {
  res.json([]);
});

router.get('/tasks/:id', (req: Request, res: Response) => {
  res.json({});
});

router.delete('/tasks/:id', (req: Request, res: Response) => {
  res.json({});
});

export default router;
