'use server';
import { Task, TaskListResponse, taskListResponseSchema } from '@/lib/types';
import TaskList from './task.list';

interface TaskListPanelProps {
  className?: string;
}

async function getTasksListResponse(): Promise<TaskListResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`);
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: ${res.statusText}`);
  }
  const tasks = await res.json();
  return tasks;
}

export default async function TaskListPanel({ className }: TaskListPanelProps) {
  const tasksListResponse = await getTasksListResponse();
  try {
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
