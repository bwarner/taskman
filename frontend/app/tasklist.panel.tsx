'use server';
import { TaskListResponse, taskListResponseSchema } from '@/lib/types';
import TaskList from './task.list';

interface TaskListPanelProps {
  className?: string;
}

async function getTasksListResponse(): Promise<TaskListResponse> {
  console.log(`Fetching tasks from ${process.env.NEXT_PUBLIC_API_URL}/tasks`);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`);
  if (!res.ok) {
    console.error(`Failed to fetch tasks: ${res.statusText}`);
    console.error(res);
    throw new Error(`Failed to fetch tasks: ${res.statusText}`);
  }
  const tasks = await res.json();
  return tasks;
}

export default async function TaskListPanel({ className }: TaskListPanelProps) {
  let tasksListResponse;
  try {
    tasksListResponse = await getTasksListResponse();
    taskListResponseSchema.parse(tasksListResponse);
  } catch (error) {
    console.error(error);
    return <div>Error: {String(error)}</div>;
  }
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold">Tasks</h2>
      <TaskList initialTaskListResponse={tasksListResponse} />
    </div>
  );
}
