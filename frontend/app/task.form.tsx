'use client';
import { useActionState, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createTaskAction } from '@/lib/actions';
import { CreateTaskInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Task } from '@/lib/types';

export default function TaskForm({
  className,
  task,
}: {
  className?: string;
  task?: Task;
}) {
  const initialTask = task ?? {
    id: '',
    name: `Task Name ${Math.random()}`,
    schedule: {
      type: 'single',
      date: new Date().toISOString(),
    },
  };
  const initialState: CreateTaskInput = {
    ...initialTask,
    error: {
      name: '',
      schedule: {
        type: '',
        date: '',
        cronExpression: '',
      },
      message: '',
    },
  };

  const [state, formAction, isPending] = useActionState(
    createTaskAction,
    initialState
  );

  console.log(' state', state);
  const [scheduleType, setScheduleType] = useState<'single' | 'recurring'>(
    initialState.schedule.type
  );
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{task ? 'Edit' : 'Create'} Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          {state.error?.message && (
            <div className="text-red-500">{state.error.message}</div>
          )}
          <input type="hidden" name="id" value={task?.id} />
          {state.error?.name && (
            <div className="text-red-500">{state.error.name}</div>
          )}
          <div className="space-y-2">
            <Label>
              Name:
              <Input
                name="name"
                type="text"
                required
                placeholder="Enter task name"
                defaultValue={state.name}
              />
            </Label>
          </div>
          <div className="space-y-2">
            {state.error?.schedule?.type && (
              <div className="text-red-500">{state.error.schedule.type}</div>
            )}
            <Label>
              Schedule:
              <RadioGroup
                name="schedule.type"
                defaultValue={scheduleType}
                onValueChange={(value) =>
                  setScheduleType(value as 'single' | 'recurring')
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single">Single</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recurring" id="recurring" />
                  <Label htmlFor="recurring">Recurring</Label>
                </div>
              </RadioGroup>
            </Label>
          </div>
          {scheduleType === 'single' && (
            <div className="space-y-2">
              {state.error?.schedule?.date && (
                <div className="text-red-500">{state.error.schedule.date}</div>
              )}
              <Label>
                Date:
                <Input
                  name="schedule.date"
                  type="text"
                  defaultValue={
                    state.schedule?.type === 'single'
                      ? state.schedule?.date
                      : ''
                  }
                />
              </Label>
            </div>
          )}
          {scheduleType === 'recurring' && (
            <div className="space-y-2">
              {state.error?.schedule?.cronExpression && (
                <div className="text-red-500">
                  {state.error.schedule.cronExpression}
                </div>
              )}
              <Label>
                Cron Expression:
                <Input
                  name="schedule.cronExpression"
                  type="text"
                  defaultValue={
                    state.schedule?.type === 'recurring'
                      ? state.schedule?.cronExpression
                      : ''
                  }
                />
              </Label>
            </div>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
