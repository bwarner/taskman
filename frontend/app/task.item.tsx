import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/lib/types';
import { useState } from 'react';
import { useTaskStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

function TaskItem({ task }: { task: Task }) {
  const { fetchTasks, deleteTask } = useTaskStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const handleDelete = () => {
    setIsDeleting(true);
    deleteTask(task.id);
    setIsDeleting(false);
    fetchTasks();
  };
  return (
    <Card key={task.id}>
      <CardHeader>
        <CardTitle>{task.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {task.schedule.type === 'recurring' && (
          <div>{task.schedule.cronExpression}</div>
        )}
        {task.schedule.type === 'single' && <div>{task.schedule.date}</div>}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/edit/${task.id}`)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : ' Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskItem;
