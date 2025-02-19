import { z } from 'zod';
import { CronExpressionParser } from 'cron-parser';

export const iso8601DateProperty = z.string().refine(
  (value) => {
    // Validate format with regex
    const iso8601Regex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!iso8601Regex.test(value)) return false;

    // Ensure it's a valid date
    const date = new Date(value);
    return !isNaN(date.getTime()) && value === date.toISOString();
  },
  {
    message: 'Invalid ISO8601 date format or invalid date',
  }
);

const cronExpressionProperty = z.string().refine(
  (value) => {
    try {
      CronExpressionParser.parse(value);
      return true;
    } catch (error) {
      console.error(`Invalid cron expression: ${value}`, error);
      return false;
    }
  },
  {
    message: 'Invalid cron expression',
  }
);

const singleScheduleSchema = z.object({
  type: z.literal('single'),
  date: iso8601DateProperty,
});

const recurringScheduleSchema = z.object({
  type: z.literal('recurring'),
  cronExpression: cronExpressionProperty,
});

const ErrorSchema = z.object({
  name: z.string().optional(),
  schedule: z
    .object({
      type: z.string().optional(),
      date: z.string().optional(),
      cronExpression: z.string().optional(),
    })
    .optional(),
  message: z.string().optional(),
});

type ErrorModel = z.infer<typeof ErrorSchema>;

const createTaskInputSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, 'Task name must be at least 3 characters')
    .transform((val) => val.trim().slice(0, 100)),

  schedule: z.union([singleScheduleSchema, recurringScheduleSchema]),
  message: z.string().optional(),
  error: ErrorSchema.optional(),
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
  ErrorSchema,
  type ErrorModel,
};
