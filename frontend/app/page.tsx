import Footer from './footer';
import TaskForm from './task.form';
import TaskListPanel from './tasklist.panel';
import Event from './event';
import CronFormat from './cron.format';
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="py-4 px-6 bg-gray-800 text-white text-center sm:text-left">
        <h1 className="text-xl font-bold sm:text-2xl">Task Manager</h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-8xl flex flex-col md:flex-row gap-6">
          {/* Task Form */}
          <div className="w-full md:w-1/2 bg-white p-4 shadow-lg rounded-lg">
            <TaskForm />
            <CronFormat />
          </div>

          {/* Task List Panel */}
          <div className="w-full md:w-1/2 bg-white p-4 shadow-lg rounded-lg">
            <TaskListPanel />
          </div>
        </div>
      </main>
      <Event />
      {/* Footer */}
      <Footer className="mt-auto bg-gray-200 py-4 text-center text-sm" />
    </div>
  );
}
