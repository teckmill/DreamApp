import React, { useState } from 'react';
import { Calendar, Trophy, Users, Clock } from 'lucide-react';

interface DreamEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  participants: string[];
  type: 'challenge' | 'discussion' | 'workshop';
  capacity?: number;
  host: string;
  location: 'online' | 'in-person';
  tags: string[];
}

export default function Events() {
  const [events, setEvents] = useState<DreamEvent[]>([
    {
      id: '1',
      title: 'Lucid Dreaming Challenge',
      description: 'Join our 7-day lucid dreaming challenge! Learn techniques, share experiences, and track your progress.',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      participants: [],
      type: 'challenge',
      capacity: 50,
      host: 'DreamMaster',
      location: 'online',
      tags: ['lucid', 'challenge', 'beginner-friendly']
    },
    {
      id: '2',
      title: 'Dream Interpretation Workshop',
      description: 'Learn how to analyze and interpret your dreams with our expert dream analysts.',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      participants: [],
      type: 'workshop',
      capacity: 30,
      host: 'DreamInterpreter',
      location: 'online',
      tags: ['interpretation', 'workshop', 'learning']
    }
  ]);

  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [filter, setFilter] = useState<'all' | 'challenges' | 'workshops' | 'discussions'>('all');

  const handleJoinEvent = (eventId: string) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          participants: [...event.participants, 'currentUserId'] // Replace with actual user ID
        };
      }
      return event;
    }));
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'challenges') return event.type === 'challenge';
    if (filter === 'workshops') return event.type === 'workshop';
    if (filter === 'discussions') return event.type === 'discussion';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dream Events & Challenges</h2>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Create Event
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        {['all', 'challenges', 'workshops', 'discussions'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={`px-4 py-2 rounded-lg ${
              filter === filterType
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{event.title}</h3>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="capitalize">{event.location}</span>
                </div>
              </div>
              {event.type === 'challenge' && (
                <Trophy className="h-6 w-6 text-yellow-500" />
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {event.description}
            </p>

            <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>
                  {event.participants.length}
                  {event.capacity && ` / ${event.capacity}`} participants
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => handleJoinEvent(event.id)}
              disabled={event.capacity ? event.participants.length >= event.capacity : false}
              className={`w-full py-2 rounded-lg ${
                event.capacity && event.participants.length >= event.capacity
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {event.capacity && event.participants.length >= event.capacity
                ? 'Event Full'
                : 'Join Event'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 