import React from 'react';
import { Calendar, Trophy } from 'lucide-react';

interface DreamEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  participants: string[];
  type: 'challenge' | 'discussion' | 'workshop';
}

export default function Events() {
  const [events, setEvents] = useState<DreamEvent[]>([]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dream Events & Challenges</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{event.title}</h3>
                <p className="text-gray-500 text-sm">
                  {new Date(event.startDate).toLocaleDateString()} - 
                  {new Date(event.endDate).toLocaleDateString()}
                </p>
              </div>
              {event.type === 'challenge' && (
                <Trophy className="h-6 w-6 text-yellow-500" />
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg">
              Join Event
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 