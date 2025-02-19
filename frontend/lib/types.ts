import { z } from 'zod';

const singleScheduleSchema = z.object({
  type: z.literal('single'),
  date: z.string(),
});
const recurringScheduleSchema = z.object({
  type: z.literal('recurring'),
  cronExpression: z.string(),
});

const createTaskInputSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, 'Task name must be at least 3 characters')
    .transform((val) => val.trim().slice(0, 100)),
  // recurring: z
  //   .union([z.string(), z.boolean()])
  //   .transform((val) => val === 'on' || val === true)
  //   .refine((val) => val === true),
  schedule: z.union([singleScheduleSchema, recurringScheduleSchema]),
  message: z.string().optional(),
  error: z
    .object({
      name: z.string().optional(),
      schedule: z
        .object({
          type: z.string().optional(),
          date: z.string().optional(),
          cronExpression: z.string().optional(),
        })
        .optional(),
      message: z.string().optional(),
    })
    .optional(),
});

type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  schedule: z.union([singleScheduleSchema, recurringScheduleSchema]),
});

type Task = z.infer<typeof taskSchema>;

const taskListResponseSchema = z.object({
  tasks: z.array(taskSchema),
  limit: z.number(),
  offset: z.number(),
  total: z.number(),
});

type TaskListResponse = z.infer<typeof taskListResponseSchema>;

export {
  createTaskInputSchema,
  type CreateTaskInput,
  taskSchema,
  type Task,
  taskListResponseSchema,
  type TaskListResponse,
};
