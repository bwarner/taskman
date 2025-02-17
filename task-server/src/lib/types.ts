import { Schema, z } from 'zod';

// Schedule types
// single schedule is an ISO 8601 date string
// recurring schedule is a cron expression
const scheduleTypeSchema = z.enum(['single', 'recurring']);
const singleScheduleSchema = z.object({
  type: z.literal('single'),
  date: z.string(),
});
const recurringScheduleSchema = z.object({
  type: z.literal('recurring'),
  cronExpression: z.string(),
});

const taskStatusSchema = z.enum(['pending', 'completed', 'failed']);

const createTaskInputSchema = z.object({
  name: z.string().min(3, 'Task name must be at least 3 characters'),
  schedule: z.union([singleScheduleSchema, recurringScheduleSchema]),
});
type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

const updateTaskInputSchema = z.object({
  schedule: z.union([singleScheduleSchema, recurringScheduleSchema]),
});
type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  schedule: z.union([singleScheduleSchema, recurringScheduleSchema]),
  status: taskStatusSchema,
});
type Task = z.infer<typeof taskSchema>;

const taskListSchema = z.object({
  offset: z.number(),
  limit: z.number(),
  tasks: z.array(taskSchema),
  total: z.number(),
});
type TaskListResponse = z.infer<typeof taskListSchema>;

type TaskList = z.infer<typeof taskListSchema>;

export {
  createTaskInputSchema,
  updateTaskInputSchema,
  taskSchema,
  taskListSchema,
};
export type { CreateTaskInput, UpdateTaskInput, Task, TaskListResponse };
