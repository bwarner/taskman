import { Cluster } from 'ioredis';
import { Task, UpdateTaskInput } from './lib/types.js';
import { CreateTaskInput, taskSchema } from './lib/types.js';
import { nanoid } from 'nanoid';
import logger from './logger.js';

function isoToUnix(isoDateString: string) {
  const date = new Date(isoDateString);
  const unixTimestampMilliseconds = date.getTime();
  const unixTimestampSeconds = Math.floor(unixTimestampMilliseconds / 1000);
  return unixTimestampSeconds;
}

export class TaskService {
  constructor(private readonly redis: Cluster) {}

  async createTask(input: CreateTaskInput) {
    const id = nanoid();
    const task: Task = {
      id,
      name: input.name,
      schedule: input.schedule,
      status: 'pending',
    };

    if (task.schedule.type === 'single') {
      await this.redis.zadd(
        'scheduled-tasks',
        isoToUnix(task.schedule.date),
        id,
      );
    } else {
      await this.redis.sadd('recurring-tasks', id);
    }
    await this.redis.set(`task:${id}`, JSON.stringify(task));
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const task = await this.getTask(id);
    if (task) {
      const updatedTask = { ...task, ...input };
      if (updatedTask.schedule.type !== task.schedule.type) {
        if (task.schedule.type === 'single') {
          await this.redis.zrem('scheduled-tasks', id);
        } else {
          await this.redis.srem('recurring-tasks', id);
        }
      }

      if (updatedTask.schedule.type === 'single') {
        await this.redis.zadd(
          'scheduled-tasks',
          isoToUnix(updatedTask.schedule.date),
          id,
        );
      } else {
        await this.redis.sadd('recurring-tasks', id);
      }
      await this.redis.set(`task:${id}`, JSON.stringify(updatedTask));
      return updatedTask;
    } else {
      throw new Error('Task not found');
    }
  }
  async getTask(id: string) {
    const json = await this.redis.get(`task:${id}`);
    if (json) {
      const data = JSON.parse(json);
      const result = taskSchema.safeParse(data);
      if (result.success) {
        return result.data;
      }
    }
    return null;
  }

  async getTasks(options: { offset: number; limit: number }) {
    const tasks = await this.redis.zrange(
      'scheduled-tasks',
      options.offset,
      options.offset + options.limit - 1,
    );
    return tasks.map(async (id) => {
      let task = null;
      try {
        const json = await this.redis.get(`task:${id}`);
        if (json) {
          const data = JSON.parse(json);
          const result = taskSchema.safeParse(data);
          if (result.success) {
            task = result.data;
          }
        }
      } catch (error) {
        logger.error(`Error getting task ${id}: ${error}`);
      }
      return task;
    });
  }
}
