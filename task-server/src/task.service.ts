import { Task, TaskList, UpdateTaskInput } from './lib/types.js';
import { CreateTaskInput, taskSchema } from './lib/types.js';
import { nanoid } from 'nanoid';
import logger from './logger.js';
import { createClient } from 'redis';
import { flatten, unflatten } from 'flat';
import { ZodSchema } from 'zod';
import { isoToCronLike, isoToUnix } from './lib/utils.js';
import { TASK_EVENTS, TASK_EVENTS_CHANNEL } from './lib/const.js';
import { CronExpressionParser } from 'cron-parser';

// Constants for Redis keys
const KEYS = {
  SCHEDULED_TASKS: 'scheduled-tasks',
  RECURRING_TASKS: 'recurring-tasks',
  ALL_TASKS: 'all-tasks',
  TASK_PREFIX: 'task:',
  LAST_RUN: 'last-run',
} as const;

export class TaskNotFoundError extends Error {
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

async function executeBatch(redis: RedisClient, script: RedisTransaction) {
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
    logger.error(`Task not found: ${key}`);
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

  async notify(event: string) {
    await this.redis.publish(TASK_EVENTS_CHANNEL, event);
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const id = this.generateTaskId();
    const task: Task = {
      id,
      name: input.name,
      schedule: input.schedule,
      status: 'pending',
    };

    try {
      const result = await executeBatch(this.redis, async (multi) => {
        multi.sAdd(KEYS.ALL_TASKS, id);
        toFieldAndData(task).map(([field, value]) =>
          multi.hSet(id, field, value),
        );
      });

      if (!result) {
        throw new Error('Failed to create task');
      }

      logger.info(task, `Task created successfully: ${id}`);
      await this.notify(TASK_EVENTS.TASK_CREATED);
      return task;
    } catch (error) {
      logger.error(error, 'Failed to create task');
      throw new Error('Failed to create task');
    }
  }

  async updateInputTask(input: UpdateTaskInput): Promise<Task> {
    try {
      const existingTask = await this.getTask(input.id);
      const updatedTask: Task = {
        ...existingTask,
        name: input.name,
        schedule: input.schedule,
      };

      const result = await executeBatch(this.redis, async (multi) => {
        toFieldAndData(updatedTask).map(([field, value]) =>
          multi.hSet(input.id, field, value),
        );
      });

      if (!result) {
        throw new Error('Failed to update task');
      }

      logger.info(updatedTask, `Task updated successfully: ${input.id}`);
      await this.notify(TASK_EVENTS.TASK_UPDATED);
      return updatedTask;
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        throw error;
      }
      logger.error(error, 'Failed to update task');
      throw new Error('Failed to update task');
    }
  }

  async updateTask(task: Task): Promise<Task> {
    const result = await executeBatch(this.redis, async (multi) => {
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
        total: tasks.length,
      };
    } catch (error) {
      logger.error('Failed to get tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  async deleteTask(id: string): Promise<void> {
    logger.info(`deleting task ${id}`);
    try {
      const result = await executeBatch(this.redis, async (multi) => {
        multi.sRem(KEYS.RECURRING_TASKS, id);
        multi.sRem(KEYS.ALL_TASKS, id);
        multi.del(id);
      });

      if (!result) {
        throw new Error('Failed to delete task');
      }
      logger.info(result, 'result of delete task ');
      logger.info(`Task deleted successfully: ${id}`);
      await this.notify(TASK_EVENTS.TASK_DELETED);
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        throw error;
      }
      logger.error(error, 'Failed to delete task');
      throw new Error('Failed to delete task');
    }
  }

  toCronExpression(task: Task) {
    if (task.schedule.type === 'single') {
      return isoToCronLike(task.schedule.date);
    }
    return task.schedule.cronExpression;
  }

  async getNextRun(task: Task) {
    if (task.schedule.type === 'single') {
      const now = Date.now();
      const unix = isoToUnix(task.schedule.date);
      if (unix > now) {
        return unix;
      }
      return null;
    } else {
      const cronExpression = this.toCronExpression(task);
      const cronDate = CronExpressionParser.parse(cronExpression);
      const cronNext = cronDate.next();
      if (cronNext) {
        logger.debug(
          `next run for task ${task.id} to run at ${Math.floor(cronNext.toDate().getTime() / 1000)}`,
        );
        return Math.floor(cronNext.toDate().getTime() / 1000);
      }
      logger.info(`task ${task.id} has no next run`);
      this.deleteTask(task.id);
      return null;
    }
  }

  async scheduleTasks() {
    const tasks = await this.getTasks({ offset: 0, limit: 100 });
    logger.debug(`scheduling ${tasks.tasks.length} tasks`);
    for (const task of tasks.tasks) {
      const nextRun = await this.getNextRun(task);
      if (nextRun) {
        logger.debug(`next run for task ${task.id} is ${nextRun}`);
        if (!task.nextRun || nextRun > parseInt(task.nextRun)) {
          logger.info(`scheduling task ${task.id} to run at ${nextRun}`);
          this.redis.zAdd(KEYS.SCHEDULED_TASKS, {
            score: nextRun,
            value: task.id,
          });
          logger.debug(
            `Scheduled task ${task.id} to run at ${nextRun} formatted: ${new Date(nextRun * 1000)}`,
          );
          task.nextRun = nextRun.toString();
          await this.updateTask(task);
        }
      }
    }
  }

  async processTasks(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const recurringTasksIds = await this.redis.zRangeByScore(
      KEYS.SCHEDULED_TASKS,
      now,
      now + 1000 * 60,
      {
        LIMIT: { offset: 0, count: 100 },
      },
    );

    logger.debug(`processing ${recurringTasksIds.length} recurring tasks`);

    for (const taskId of recurringTasksIds) {
      const nextRun = await this.redis.zScore(KEYS.SCHEDULED_TASKS, taskId);
      logger.debug(`next run for ${taskId} is ${nextRun}`);
      logger.debug(`now is ${now}`);

      if (nextRun && nextRun > now) {
        logger.debug(
          `next run for ${taskId} is ${new Date(nextRun * 1000)} in ${
            nextRun - now
          } seconds`,
        );
        setTimeout(async () => {
          const task = await this.getTask(taskId);
          logger.info(
            `Executing task ${task.id} at ${new Date(nextRun * 1000)}`,
          );
          await this.redis.zRem(KEYS.SCHEDULED_TASKS, taskId);
          await this.notify(TASK_EVENTS.TASK_RUN + `: ${task.id}`);
        }, nextRun - now);
      }
    }
  }
}
