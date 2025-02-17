import express, { Request, Response, NextFunction } from 'express';
import { Cluster } from 'ioredis';
import { createTaskInputSchema, updateTaskInputSchema } from './lib/types.js';
import validate from './validate.js';
import logger from './logger.js';
import { TaskService } from './task.service.js';

const redisNodes = process.env.REDIS_NODES?.split(',');
let taskService: TaskService;

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
  taskService = new TaskService(redis);
  // TODO: add check for taskService initialization
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
    const createdTask = taskService.createTask(task);
    res.json(createdTask);
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
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
  const tasks = taskService.getTasks({
    offset,
    limit,
  });
  res.json(tasks);
});

router.get('/tasks/:id', (req: Request, res: Response) => {
  res.json({});
});

router.delete('/tasks/:id', (req: Request, res: Response) => {
  res.json({});
});

export default router;
