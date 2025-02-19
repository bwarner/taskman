import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TaskForm from './task.form';

export default function EditDialog() {
  return (
    <Dialog>
      <DialogTrigger>Edit</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This may not prevent previously scheduled tasks to run.
          </DialogDescription>
        </DialogHeader>
        <TaskForm />
      </DialogContent>
    </Dialog>
  );
}
