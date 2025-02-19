'use client';

import { TaskListResponse } from '@/lib/types';
import TaskItem from './task.item';
import { useTaskStore } from '@/lib/store';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TaskListProps {
  initialTaskListResponse: TaskListResponse;
  className?: string;
}

export default function TaskList({
  initialTaskListResponse,
  className,
}: TaskListProps) {
  const {
    tasks,
    setTasks,
    total,
    setTotal,
    offset,
    setOffset,
    limit,
    setLimit,
    fetchTasks,
  } = useTaskStore();

  // ✅ Initialize Zustand store **once** with server-fetched data
  useEffect(() => {
    setTasks(initialTaskListResponse.tasks);
    setTotal(initialTaskListResponse.total);
    setOffset(initialTaskListResponse.offset);
    setLimit(initialTaskListResponse.limit);
  }, [setTasks, setTotal, setOffset, setLimit, initialTaskListResponse]);

  return (
    <div className={className}>
      <div>
        <ul>
          <li> Count: {total} </li>
          <li> Offset: {offset} </li>
          <li> Limit: {limit} </li>
          <Button
            className="hover:bg-blue-600 active:bg-blue-800 focus:ring-2 focus:ring-blue-500"
            onClick={fetchTasks}
          >
            Fetch Tasks
          </Button>
        </ul>
      </div>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
