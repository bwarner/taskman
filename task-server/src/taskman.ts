import express, { NextFunction, Request, Response } from 'express';
import { createTaskInputSchema, updateTaskInputSchema } from './lib/types.js';
import validate from './validate.js';
import logger from './logger.js';
import { TaskService } from './task.service.js';
import { createClient } from 'redis';

let client = createClient({
  url: process.env.REDIS_URL,
});

try {
  await client.connect();
  console.log('Cluster says:', await client.get('task1'));
} catch (err) {
  logger.error('Redis error:', err);
}

logger.info('Connected to Redis');
const taskService = new TaskService(client);

client.on('error', (err) => {
  logger.error('Redis error:', err);
});

const router = express.Router();

router.post(
  '/tasks',
  validate(createTaskInputSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = req.body;
      const createdTask = await taskService.createTask(task);
      res.json(createdTask);
    } catch (err) {
      console.error('error in createTask', err);
      next(err);
    }
  },
);

router.put(
  '/tasks/:id',
  validate(updateTaskInputSchema),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = req.body;
      const updatedTask = taskService.updateTask(task);
      res.json(updatedTask);
    } catch (err) {
      next(err);
    }
  },
);

router.get('/tasks', async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
  const taskList = await taskService.getTasks({
    offset,
    limit,
  });
  res.json(taskList);
});

router.get('/tasks/:id', async (req: Request, res: Response) => {
  const task = await taskService.getTask(req.params.id);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

router.delete('/tasks/:id', (req: Request, res: Response) => {
  res.json({});
});

export default router;
