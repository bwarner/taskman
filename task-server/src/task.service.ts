import { Cluster } from "ioredis";
import { Task } from "./lib/types.js";
import { CreateTaskInput } from "./lib/types.js";
import { nanoid } from 'nanoid';

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
      await this.redis.zadd('scheduled-tasks', isoToUnix(task.schedule.date), id););
    } else {
      await this.redis.sadd('recurring-tasks', id);
    }
    await this.redis.set(`task:${id}`, JSON.stringify(task));
  }

  async getTasks() {
}

export default new TaskService(global.redis);

