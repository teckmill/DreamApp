import React, { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { ModerationProps } from '../../types/moderation';

interface DreamGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  topics: string[];
  createdBy: string;
  createdAt: Date;
  isPrivate: boolean;
}

interface GroupsProps extends ModerationProps {}

export default function Groups({ onModAction, isModerator }: GroupsProps) {
  const [groups, setGroups] = useState<DreamGroup[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    topics: [''],
    isPrivate: false
  });

  const handleCreateGroup = () => {
    if (!newGroup.name || !newGroup.description) return;

    const group: DreamGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      members: [],
      topics: newGroup.topics.filter(topic => topic.trim() !== ''),
      createdBy: 'currentUserId', // Replace with actual user ID
      createdAt: new Date(),
      isPrivate: newGroup.isPrivate
    };

    setGroups([...groups, group]);
    setShowCreateGroup(false);
    setNewGroup({
      name: '',
      description: '',
      topics: [''],
      isPrivate: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dream Circles</h2>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Circle</span>
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Create Dream Circle</h3>
              <button onClick={() => setShowCreateGroup(false)} className="text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Circle Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter circle name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="What's this circle about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Topics</label>
                {newGroup.topics.map((topic, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => {
                        const newTopics = [...newGroup.topics];
                        newTopics[index] = e.target.value;
                        setNewGroup({ ...newGroup, topics: newTopics });
                      }}
                      className="flex-1 p-2 border rounded-lg"
                      placeholder="Add a topic..."
                    />
                    {index > 0 && (
                      <button
                        onClick={() => {
                          const newTopics = newGroup.topics.filter((_, i) => i !== index);
                          setNewGroup({ ...newGroup, topics: newTopics });
                        }}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewGroup({
                    ...newGroup,
                    topics: [...newGroup.topics, '']
                  })}
                  className="text-indigo-600 text-sm"
                >
                  + Add Topic
                </button>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={newGroup.isPrivate}
                  onChange={(e) => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isPrivate" className="text-sm">
                  Make this circle private
                </label>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Create Circle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{group.name}</h3>
              {group.isPrivate && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Private
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{group.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {group.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span>{group.members.length} members</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 