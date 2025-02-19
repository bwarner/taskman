'use server';
import { ZodError } from 'zod';
import {
  createTaskInputSchema,
  ErrorModel,
  type CreateTaskInput,
} from '@/lib/types';
import { decode } from 'decode-formdata';

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
    const errorModel: ErrorModel = {
      name: '',
      schedule: {
        type: '',
        date: '',
        cronExpression: '',
      },
      message: '',
    };
    console.log(' e', e);
    if (e instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedErrors = e.format() as any;
      console.log(' formattedErrors', formattedErrors);
      if (formattedErrors?.name?._errors?.length > 0) {
        errorModel.name = formattedErrors?.name?._errors.join(', ');
      }
      if (formattedErrors?.schedule?.date?._errors?.length > 0) {
        errorModel.schedule = errorModel.schedule || {};
        errorModel.schedule.date =
          formattedErrors?.schedule?.date?._errors.join(', ');
      }
      if (formattedErrors?.schedule?.cronExpression?._errors?.length > 0) {
        errorModel.schedule = errorModel.schedule || {};
        errorModel.schedule.cronExpression =
          formattedErrors?.schedule?.cronExpression?._errors.join(', ');
      }

      console.log(' errorModel', errorModel);
      return { ...prev, error: errorModel };
    }
    return { ...prev, error: { message: 'Invalid form data' } };
  }
}
