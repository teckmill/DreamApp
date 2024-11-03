import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';

interface DreamGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  topics: string[];
  createdBy: string;
  createdAt: Date;
}

export default function Groups() {
  const [groups, setGroups] = useState<DreamGroup[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dream Circles</h2>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Create Circle</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{group.description}</p>
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