import express, { NextFunction, Request, Response } from 'express';
import { createTaskInputSchema, updateTaskInputSchema } from './lib/types.js';
import validate from './validate.js';
import logger from './logger.js';
import { TaskService, TaskNotFoundError } from './task.service.js';
import { createClient } from 'redis';
import { TASK_EVENTS_CHANNEL } from './lib/const.js';

logger.info('Redis URL:', process.env.REDIS_URL);
let client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', (err) => {
  logger.error('Redis error:', err);
});

client.on('connect', () => {
  logger.info('Connected to Redis');
});

try {
  await client.connect();
} catch (err) {
  logger.error('Redis error:', err);
  process.exit(1);
}

const taskService = new TaskService(client);
const watcherId = setInterval(() => {
  taskService.scheduleTasks();
  taskService.processTasks();
}, 1000);

process.on('exit', () => {
  logger.info('Exiting');
  clearInterval(watcherId);
  client.quit();
});

const router = express.Router();

router.get('/tasks/schedule', async (req: Request, res: Response) => {
  await taskService.scheduleTasks();
  res.json({ message: 'Tasks scheduled' });
});

router.get('/tasks/process', async (req: Request, res: Response) => {
  await taskService.scheduleTasks();
  await taskService.processTasks();
  res.json({ message: 'Tasks processed' });
});

router.post(
  '/tasks',
  validate(createTaskInputSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = req.body;
      const createdTask = await taskService.createTask(task);
      logger.info(createdTask, 'created task');
      res.json(createdTask);
    } catch (err) {
      logger.error(err, 'error in createTask');
      next(err);
    }
  },
);

router.get('/events', async (req: Request, res: Response) => {
  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    const stream = client.duplicate();
    await stream.connect();
    logger.info('Subscribing to task-events');
    const subscription = await stream.subscribe(
      TASK_EVENTS_CHANNEL,
      (message) => {
        logger.info(message, 'Received message');
        res.write(`data: ${message}\n\n`);
      },
    );
    stream.on('message', (message) => {
      logger.info(message, 'Received message');
      res.write(`data: ${message}\n\n`);
    });
    stream.on('error', (err) => {
      logger.error(err, 'Error on stream');
    });

    res.on('close', () => {
      logger.info('Client disconnected');
      subscription;
      stream.unsubscribe(TASK_EVENTS_CHANNEL);
      stream.quit();
    });
  } catch (err) {
    logger.error(err, 'Error on subscribe');
  }
});

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
  try {
    const task = await taskService.getTask(req.params.id);
    res.json(task);
  } catch (err) {
    if (err instanceof TaskNotFoundError) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    throw err;
  }
});

router.delete('/tasks/:id', async (req: Request, res: Response) => {
  const task = await taskService.deleteTask(req.params.id);
  res.json(task);
});

export default router;
