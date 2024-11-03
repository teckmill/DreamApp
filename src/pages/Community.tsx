import React, { useState } from 'react';
import { Bell, MessageCircle, Users, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Categories from './Community/Categories';
import Interpretations from './Community/Interpretations';
import Polls from './Community/Polls';
import Mentorship from './Community/Mentorship';
import Events from './Community/Events';
import Groups from './Community/Groups';
import Guidelines from './Community/Guidelines';

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return <Categories />;
      case 'interpretations':
        return <Interpretations />;
      case 'polls':
        return <Polls />;
      case 'mentorship':
        return <Mentorship />;
      case 'events':
        return <Events />;
      case 'groups':
        return <Groups />;
      case 'guidelines':
        return <Guidelines />;
      default:
        return <Categories />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dream Community</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-sm">2.5k Members</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm">150 Active</span>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Your Dreams</span>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold mt-2">23</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Interpretations</span>
              <MessageCircle className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold mt-2">12</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Reputation</span>
              <Star className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold mt-2">450</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Notifications</span>
              <Bell className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold mt-2">3</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'categories', label: 'Categories' },
              { id: 'interpretations', label: 'Interpretations' },
              { id: 'polls', label: 'Polls' },
              { id: 'mentorship', label: 'Mentorship' },
              { id: 'events', label: 'Events' },
              { id: 'groups', label: 'Groups' },
              { id: 'guidelines', label: 'Guidelines' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}