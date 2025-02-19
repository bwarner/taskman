'use client';
import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FieldError from '@/lib/ui';
import {
  mergeForm,
  useForm,
  useStore,
  useTransform,
} from '@tanstack/react-form';
import { initialFormState } from '@tanstack/react-form/nextjs';
import { formOpts } from './form.ops';
import { createTaskAction } from '@/lib/actions';
import { CreateTaskInput, createTaskInputSchema } from '@/lib/types';
import { ZodValidator, zodValidator } from '@tanstack/zod-form-adapter';
export function TaskForm() {
  const [state, formAction] = useActionState(
    createTaskAction,
    initialFormState
  );

  // const form = useForm({
  const form = useForm<CreateTaskInput, ZodValidator>({
    ...formOpts,
    transform: useTransform<CreateTaskInput>(
      (baseForm) => {
        if (state) {
          console.log('baseForm', baseForm);
          return mergeForm<CreateTaskInput, ZodValidator>(baseForm, state);
        }
        return baseForm;
      },
      [state]
    ),
    validators: zodValidator(createTaskSchema),
  });

  const formErrors = useStore(form.store, (formState) => {
    console.log('useStore Form State:', formState);
    // return formState.errors;
    return formState.errorMap.onServer
      ? [
          typeof formState.errorMap.onServer === 'string'
            ? formState.errorMap.onServer
            : 'Validation failed',
        ]
      : [];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction as never} onSubmit={() => form.handleSubmit()}>
          {formErrors.length > 0 && (
            <div className="space-y-2">
              {/* <p className="text-sm font-medium text-destructive">
                Form Errors: <pre>{JSON.stringify(formErrors, null, 2)}</pre>
              </p> */}
              <ul className="list-disc pl-5">
                {formErrors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <form.Field name="name">
            {(fieldApi) => (
              <div className="space-y-2">
                <Label>
                  Name:
                  <Input
                    name={fieldApi.name}
                    type="text"
                    placeholder="Enter task name"
                    value={fieldApi.state.value}
                    onChange={(e) => fieldApi.handleChange(e.target.value)}
                  />
                  <FieldError fieldMeta={fieldApi.getMeta()} />
                </Label>
              </div>
            )}
          </form.Field>
          <form.Field name="name">
            {(fieldApi) => (
              <div className="space-y-2">
                <Label>
                  Name:
                  <Input
                    name={fieldApi.name}
                    type="text"
                    placeholder="Enter task name"
                    value={fieldApi.state.value}
                    onChange={(e) => fieldApi.handleChange(e.target.value)}
                  />
                  <FieldError fieldMeta={fieldApi.getMeta()} />
                </Label>
              </div>
            )}
          </form.Field>
          <form.Field name="name">
            {(fieldApi) => (
              <div className="space-y-2">
                <Label>
                  Name:
                  <Input
                    name={fieldApi.name}
                    type="text"
                    placeholder="Enter task name"
                    value={fieldApi.state.value}
                    onChange={(e) => fieldApi.handleChange(e.target.value)}
                  />
                  <FieldError fieldMeta={fieldApi.getMeta()} />
                </Label>
              </div>
            )}
          </form.Field>
        </form>
      </CardContent>
    </Card>
  );
}
