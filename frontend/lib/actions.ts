import { formOpts } from '@/app/form.ops';
import {
  ServerValidateError,
  createServerValidate,
} from '@tanstack/react-form/nextjs';
import { SafeParseReturnType } from 'zod';
import { createTaskInputSchema, type CreateTaskInput } from '@/lib/types';
import { decode } from 'decode-formdata';

const serverValidate = createServerValidate({
  ...formOpts,
  onServerValidate: async ({ value }) => {
    // console.log('Welcome Form Data:', value);
    const parsed: SafeParseReturnType<CreateTaskInput, unknown> =
      createTaskInputSchema.safeParse(value);
    if (!parsed.success) {
      const errorGroups = parsed.error.errors.reduce((acc, e) => {
        const path = e.path.join('.');
        if (!acc[path]) {
          acc[path] = [];
        }
        acc[path].push(e.message);
        return acc;
      }, {} as Record<string, string[]>);
      console.log('Error Groups:', errorGroups);
      const errors = Object.entries(errorGroups)
        .map(([path, messages]) => `${path}: ${messages.join(', ')}`)
        .join('; ');

      return errors;
    }
    return undefined; // No errors
  },
});

export async function createTaskAction(prev: unknown, formData: FormData) {
  try {
    await serverValidate(formData);

    const formObject = decode(formData);
    console.log(formObject);
    const parsed = createTaskInputSchema.parse(formObject);
    console.log(parsed);
    return { ...parsed, message: 'Task created successfully' };
  } catch (e) {
    if (e instanceof ServerValidateError) {
      console.error('Validation Error:', e);
      console.error('Validation Error formState:', e.formState);
      return e.formState; // Return validation errors to the client
    }
    return { error: 'Invalid form data' };
  }
}
