import { formOptions } from '@tanstack/react-form';
import { CreateTaskInput } from '@/lib/types';

const defaultValues: CreateTaskInput = {
  name: 'Task Name',
  schedule: {
    type: 'single',
    date: new Date().toISOString(),
  },
};
export const formOpts = formOptions({
  defaultValues,
});
