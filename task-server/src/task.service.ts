import { Task, TaskList, UpdateTaskInput } from './lib/types.js';
import { CreateTaskInput, taskSchema } from './lib/types.js';
import { nanoid } from 'nanoid';
import logger from './logger.js';
import { createClient } from 'redis';
import { flatten, unflatten } from 'flat';
import { ZodSchema } from 'zod';
import { isoToCronLike, isoToUnix } from './lib/utils.js';
// Constants for Redis keys
const KEYS = {
  SCHEDULED_TASKS: 'scheduled-tasks',
  RECURRING_TASKS: 'recurring-tasks',
  ALL_TASKS: 'all-tasks',
  TASK_PREFIX: 'task:',
  LAST_RUN: 'last-run',
} as const;

class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`);
    this.name = 'TaskNotFoundError';
  }
}

function toFieldAndData(data: Task) {
  const flattenedData = flatten(data) as Record<string, string>;
  return Object.entries(flattenedData);
}

type RedisClient = ReturnType<typeof createClient>;
type RedisTransaction = (
  multi: ReturnType<RedisClient['multi']>,
) => Promise<void>;

async function executeMulti(redis: RedisClient, script: RedisTransaction) {
  const multi = redis.multi();
  await script(multi);
  return multi.exec();
}

async function getHash<T>(
  redis: ReturnType<typeof createClient>,
  key: string,
  schema: ZodSchema<T>,
): Promise<T> {
  const data = await redis.hGetAll(key);
  if (!Object.keys(data).length) {
    throw new TaskNotFoundError(key);
  }
  const unflattenedData = unflatten(data);
  return schema.parse(unflattenedData);
}

export class TaskService {
  constructor(private readonly redis: ReturnType<typeof createClient>) {}

  private generateTaskId(): string {
    return `${KEYS.TASK_PREFIX}${nanoid()}`;
  }

  private async executeMulti() {
    try {
      return await this.redis.multi().exec();
    } catch (error) {
      logger.error('Redis transaction failed:', error);
      throw new Error('Failed to execute Redis transaction');
    }
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const id = this.generateTaskId();
    const task: Task = {
      id,
      name: input.name,
      schedule:
        input.schedule.type === 'single'
          ? isoToCronLike(input.schedule.date)
          : input.schedule.cronExpression,
      status: 'pending',
    };

    try {
      const result = await executeMulti(this.redis, async (multi) => {
        multi.sAdd(KEYS.ALL_TASKS, id);
        toFieldAndData(task).map(([field, value]) =>
          multi.hSet(id, field, value),
        );
      });

      if (!result) {
        throw new Error('Failed to create task');
      }

      logger.info('Task created successfully:', { taskId: id });
      return task;
    } catch (error) {
      logger.error('Failed to create task:', error);
      throw new Error('Failed to create task');
    }
  }

  async updateInputTask(input: UpdateTaskInput): Promise<Task> {
    try {
      const existingTask = await this.getTask(input.id);
      const updatedTask: Task = {
        ...existingTask,
        name: input.name,
        schedule:
          input.schedule.type === 'single'
            ? isoToCronLike(input.schedule.date)
            : input.schedule.cronExpression,
      };

      const result = await executeMulti(this.redis, async (multi) => {
        toFieldAndData(updatedTask).map(([field, value]) =>
          multi.hSet(input.id, field, value),
        );
      });

      if (!result) {
        throw new Error('Failed to update task');
      }

      logger.info('Task updated successfully:', { taskId: input.id });
      return updatedTask;
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        throw error;
      }
      logger.error('Failed to update task:', error);
      throw new Error('Failed to update task');
    }
  }

  async updateTask(task: Task): Promise<Task> {
    const result = await executeMulti(this.redis, async (multi) => {
      toFieldAndData(task).map(([field, value]) =>
        multi.hSet(task.id, field, value),
      );
    });

    if (!result) {
      throw new Error('Failed to update task');
    }
    return task;
  }

  async getTask(id: string): Promise<Task> {
    try {
      return await getHash(this.redis, id, taskSchema);
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        throw error;
      }
      logger.error(`Error getting task ${id}:`, error);
      throw new Error('Failed to get task');
    }
  }

  async getTasks(options: {
    offset: number;
    limit: number;
  }): Promise<TaskList> {
    try {
      const rawTasks = await this.redis.sMembers(KEYS.ALL_TASKS);
      const totalTasks = rawTasks.length;

      const page = rawTasks.slice(
        options.offset,
        Math.min(options.offset + options.limit, totalTasks),
      );

      const tasks = (
        await Promise.allSettled(page.map((id) => this.getTask(id)))
      )
        .filter(
          (result): result is PromiseFulfilledResult<Task> =>
            result.status === 'fulfilled',
        )
        .map((result) => result.value);

      return {
        tasks,
        offset: options.offset,
        limit: options.limit,
        total: totalTasks,
      };
    } catch (error) {
      logger.error('Failed to get tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const multi = this.redis.multi();

      multi.sRem(KEYS.RECURRING_TASKS, id);

      // Remove from all-tasks set and delete hash
      multi.sRem(KEYS.ALL_TASKS, id);
      multi.del(id);

      await this.executeMulti();
      logger.info('Task deleted successfully:', { taskId: id });
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        throw error;
      }
      logger.error('Failed to delete task:', error);
      throw new Error('Failed to delete task');
    }
  }

  async executeTasks(task: Task) {
    const now = Date.now();
    const nextRun =
      isoToUnix(task.schedule) > now ? isoToUnix(task.schedule) - now : 0;
    if (nextRun > 0) {
      // eslint-disable-next-line no-undef
      await new Promise((resolve) => setTimeout(resolve, nextRun));
      logger.info('Executing task:', { taskId: task.id, name: task.name });
    } else {
      logger.info('Task is already due:', { taskId: task.id, name: task.name });
    }
  }

  async isTaskDue(task: Task) {
    const now = Date.now();
    const nextRun =
      isoToUnix(task.schedule) > now ? isoToUnix(task.schedule) - now : 0;
    return nextRun > 0;
  }

  async scheduleTasks() {
    const taskIds = await this.redis.lRange(KEYS.ALL_TASKS, 0, -1);
    for (const taskId of taskIds) {
      const task = await this.getTask(taskId);
      if (await this.isTaskDue(task)) {
        this.redis.zAdd(KEYS.SCHEDULED_TASKS, {
          score: isoToUnix(task.schedule),
          value: taskId,
        });
      }
    }
  }

  async getTasksToExecute(): Promise<Task[]> {
    const lastRun = Number.parseInt(
      (await this.redis.get(KEYS.LAST_RUN)) || '0',
    );
    const until = lastRun + 1000 * 60;
    const recurringTasksIds = await this.redis.zRangeByScore(
      KEYS.SCHEDULED_TASKS,
      lastRun,
      until,
    );
    const tasks = (
      await Promise.allSettled(
        recurringTasksIds.map(async (taskId) => this.getTask(taskId)),
      )
    )
      .filter(
        (result): result is PromiseFulfilledResult<Task> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value)
      .filter((task) => Boolean(task));

    return tasks;
  }
}
