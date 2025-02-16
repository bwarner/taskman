import express, { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { createTaskInputSchema, updateTaskInputSchema } from './lib/types.js';
import validate from './validate.js';

const router = express.Router();

router.post(
  '/tasks',
  validate(createTaskInputSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const task = req.body;
    res.json(task);
    next();
  }
);

router.put(
  '/tasks/:id',
  validate(updateTaskInputSchema),
  (req: Request, res: Response) => {
    const task = req.body;
    res.json(task);
  }
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
