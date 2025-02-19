import TaskForm from '@/app/task.form';

export default async function EditPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`
  );
  if (!response.ok) {
    return <div>Task not found</div>;
  }
  const task = await response.json();
  return (
    <div className="flex flex-col gap-4">
      <TaskForm task={task} />
    </div>
  );
}
