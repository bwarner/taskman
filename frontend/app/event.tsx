'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/lib/store';

type Event = {
  timestamp: string;
  event: string;
};
export default function Event() {
  const { fetchTasks } = useTaskStore();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/events`
    );
    eventSource.onmessage = async (event) => {
      console.log(' event', event);
      setEvents((prev) => [
        ...prev,
        { timestamp: new Date().toISOString(), event: event.data },
      ]);
      await fetchTasks();
    };
    eventSource.onerror = (event) => {
      console.log(' error', event);
    };
    return () => {
      console.log('closing event source');
      eventSource.close();
    };
  }, [fetchTasks]);
  return (
    <div>
      <div>Listening for events</div>
      <div className="h-[200px] w-full border-1 overflow-y-visible">
        {events.map((event) => (
          <div key={event.timestamp}>{event.event}</div>
        ))}
      </div>
    </div>
  );
}
