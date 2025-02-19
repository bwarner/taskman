'use server';
import { ZodError } from 'zod';
import { createTaskInputSchema, type CreateTaskInput } from '@/lib/types';
import { decode } from 'decode-formdata';
import { redirect } from 'next/navigation';
export async function deleteTaskAction(taskId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  } catch (error) {
    console.error(error);
  }
}

export async function createTaskAction(
  prev: CreateTaskInput,
  formData: FormData
): Promise<CreateTaskInput> {
  try {
    debugger;
    console.log(' prev', prev);
    const formObject = decode(formData);
    console.log(' formObject', formObject);
    debugger;
    const parsed = createTaskInputSchema.parse(formObject);
    console.log(' parsed', parsed);

    let response;
    if (prev.id) {
      response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${prev.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsed),
        }
      );
    } else {
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed),
      });
    }
    if (!response.ok) {
      return { ...prev, error: { message: 'Failed to create task' } };
    }
    const data = await response.json();
    console.log(' data', data);
    return { ...data, message: 'Task created successfully' };
  } catch (e) {
    debugger;
    console.log(' e', e);
    if (e instanceof ZodError) {
      const message = e.format();
      console.log(' message', message);
      return { ...prev, error: { message: 'Invalid form data' } };
    }
    return { ...prev, error: { message: 'Invalid form data' } };
  }
}
