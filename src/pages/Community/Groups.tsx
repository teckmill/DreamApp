import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Send, MessageCircle } from 'lucide-react';
import { ModerationProps } from '../../types/moderation';
import { useAuth } from '../../context/AuthContext';

interface DreamGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  topics: string[];
  createdBy: string;
  createdAt: Date;
  isPrivate: boolean;
  messages: GroupMessage[];
}

interface GroupMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}

interface GroupsProps extends ModerationProps {}

export default function Groups({ onModAction, isModerator }: GroupsProps) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<DreamGroup[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DreamGroup | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    topics: [''],
    isPrivate: false
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    const savedGroups = localStorage.getItem('dream_groups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
  };

  const handleCreateGroup = () => {
    if (!newGroup.name || !newGroup.description) return;

    const group: DreamGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      members: [user.id], // Creator is first member
      topics: newGroup.topics.filter(topic => topic.trim() !== ''),
      createdBy: user.id,
      createdAt: new Date(),
      isPrivate: newGroup.isPrivate,
      messages: []
    };

    const updatedGroups = [...groups, group];
    setGroups(updatedGroups);
    localStorage.setItem('dream_groups', JSON.stringify(updatedGroups));
    setShowCreateGroup(false);
    setNewGroup({
      name: '',
      description: '',
      topics: [''],
      isPrivate: false
    });
  };

  const handleJoinGroup = (groupId: string) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId && !group.members.includes(user.id)) {
        return {
          ...group,
          members: [...group.members, user.id]
        };
      }
      return group;
    });
    setGroups(updatedGroups);
    localStorage.setItem('dream_groups', JSON.stringify(updatedGroups));
  };

  const handleLeaveGroup = (groupId: string) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.members.filter(memberId => memberId !== user.id)
        };
      }
      return group;
    });
    setGroups(updatedGroups);
    localStorage.setItem('dream_groups', JSON.stringify(updatedGroups));
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null);
    }
  };

  const handleSendMessage = () => {
    if (!selectedGroup || !newMessage.trim()) return;

    const message: GroupMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      content: newMessage,
      timestamp: new Date()
    };

    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          messages: [...group.messages, message]
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    localStorage.setItem('dream_groups', JSON.stringify(updatedGroups));
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Groups List */}
        <div className="col-span-12 lg:col-span-4">
          <div className="grid gap-4">
            {groups.map(group => (
              <div 
                key={group.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg cursor-pointer
                  ${selectedGroup?.id === group.id ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => setSelectedGroup(group)}
              >
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
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{group.members.length} members</span>
                  </div>
                  {group.members.includes(user.id) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveGroup(group.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group.id);
                      }}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-12 lg:col-span-8">
          {selectedGroup ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold">{selectedGroup.name}</h3>
                <p className="text-sm text-gray-500">{selectedGroup.members.length} members</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedGroup.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.userId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      message.userId === user.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/30'
                        : 'bg-gray-100 dark:bg-gray-700/50'
                    }`}>
                      <div className="text-sm font-medium mb-1">{message.username}</div>
                      <p className="text-gray-700 dark:text-gray-300">{message.content}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              {selectedGroup.members.includes(user.id) && (
                <div className="p-4 border-t dark:border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                <p>Select a dream circle to view the conversation</p>
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
} 