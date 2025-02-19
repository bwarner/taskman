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
  error: z.string().optional(),
});

type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

export { createTaskInputSchema, type CreateTaskInput };
