import React, { useState } from 'react';
import { Calendar, Trophy, Users, Clock, Plus, X } from 'lucide-react';
import { ModerationProps } from '../../types/moderation';

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

interface EventsProps extends ModerationProps {}

export default function Events({ onModAction, isModerator }: EventsProps) {
  const [events, setEvents] = useState<DreamEvent[]>([
    {
      id: '1',
      title: 'Lucid Dreaming Challenge',
      description: 'Join our 7-day lucid dreaming challenge! Learn techniques, share experiences, and track your progress.',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      participants: [],
      type: 'challenge',
      capacity: 50,
      host: 'DreamMaster',
      location: 'online',
      tags: ['lucid', 'challenge', 'beginner-friendly']
    }
  ]);

  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'workshop' as DreamEvent['type'],
    startDate: '',
    endDate: '',
    capacity: '',
    location: 'online' as DreamEvent['location'],
    tags: ['']
  });

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.description || !newEvent.startDate || !newEvent.endDate) {
      return;
    }

    const event: DreamEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      startDate: new Date(newEvent.startDate),
      endDate: new Date(newEvent.endDate),
      participants: [],
      type: newEvent.type,
      capacity: newEvent.capacity ? parseInt(newEvent.capacity) : undefined,
      host: 'currentUser', // Replace with actual user
      location: newEvent.location,
      tags: newEvent.tags.filter(tag => tag.trim() !== '')
    };

    setEvents([...events, event]);
    setShowCreateEvent(false);
    setNewEvent({
      title: '',
      description: '',
      type: 'workshop',
      startDate: '',
      endDate: '',
      capacity: '',
      location: 'online',
      tags: ['']
    });
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          participants: [...event.participants, 'currentUserId']
        };
      }
      return event;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dream Events & Challenges</h2>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Create New Event</h3>
              <button onClick={() => setShowCreateEvent(false)} className="text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter event title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="Describe your event..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as DreamEvent['type'] })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="workshop">Workshop</option>
                  <option value="challenge">Challenge</option>
                  <option value="discussion">Discussion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Capacity (optional)</label>
                <input
                  type="number"
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <select
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value as DreamEvent['location'] })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="online">Online</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                {newEvent.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...newEvent.tags];
                        newTags[index] = e.target.value;
                        setNewEvent({ ...newEvent, tags: newTags });
                      }}
                      className="flex-1 p-2 border rounded-lg"
                      placeholder="Add a tag..."
                    />
                    {index > 0 && (
                      <button
                        onClick={() => {
                          const newTags = newEvent.tags.filter((_, i) => i !== index);
                          setNewEvent({ ...newEvent, tags: newTags });
                        }}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewEvent({
                    ...newEvent,
                    tags: [...newEvent.tags, '']
                  })}
                  className="text-indigo-600 text-sm"
                >
                  + Add Tag
                </button>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event List */}
      <div className="grid md:grid-cols-2 gap-6">
        {events.map(event => (
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