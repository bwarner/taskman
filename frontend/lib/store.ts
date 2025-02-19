import { create } from 'zustand';
import { Task, taskListResponseSchema } from './types';

export interface TaskStore {
  setTasks: (tasks: Task[]) => void;
  tasks: Task[];
  offset: number;
  limit: number;
  total: number;
  setOffset: (offset: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  fetchTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>()((set) => ({
  tasks: [],
  offset: 0,
  limit: 10,
  total: 0,
  setOffset: (offset: number) => set({ offset }),
  setLimit: (limit: number) => set({ limit }),
  setTotal: (total: number) => set({ total }),
  setTasks: (tasks: Task[]) => set({ tasks }),
  fetchTasks: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`);
    const data = await response.json();
    const parsed = taskListResponseSchema.parse(data);
    set((state) => ({
      ...state,
      tasks: parsed.tasks,
      total: parsed.total,
      offset: parsed.offset,
      limit: parsed.limit,
    }));
  },
}));
