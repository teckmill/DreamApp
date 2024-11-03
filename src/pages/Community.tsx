import React, { useState } from 'react';
import { 
  Bell, 
  MessageCircle, 
  Users, 
  Star, 
  Compass, 
  TrendingUp, 
  BookOpen,
  Calendar as CalendarIcon,
  BarChart as BarChartIcon,
  UserPlus as MentorIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { moderationService } from '../services/moderationService';
import Categories from './Community/Categories';
import Interpretations from './Community/Interpretations';
import Polls from './Community/Polls';
import Mentorship from './Community/Mentorship';
import Events from './Community/Events';
import Groups from './Community/Groups';
import Guidelines from './Community/Guidelines';

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Add handleModAction function
  const handleModAction = async (contentId: string, contentType: string, action: string) => {
    try {
      switch (action) {
        case 'pin':
          await moderationService.pinContent(contentId, contentType as any, user.id);
          setMessage({ type: 'success', text: 'Content pinned successfully' });
          break;
        case 'unpin':
          await moderationService.unpinContent(contentId, contentType as any, user.id);
          setMessage({ type: 'success', text: 'Content unpinned successfully' });
          break;
        // ... rest of the switch cases remain the same
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const mainTabs = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'categories', label: 'Categories', icon: BookOpen },
    { id: 'interpretations', label: 'Dream Analysis', icon: Star },
    { id: 'groups', label: 'Dream Circles', icon: Users },
    { id: 'events', label: 'Events', icon: CalendarIcon },
    { id: 'polls', label: 'Community Polls', icon: BarChartIcon },
    { id: 'mentorship', label: 'Mentorship', icon: MentorIcon }
  ];

  // Featured content for the Discover section
  const featuredContent = {
    popularGroups: [
      { id: '1', name: 'Lucid Dreamers', members: 234, activity: 'high' },
      { id: '2', name: 'Dream Interpreters', members: 156, activity: 'medium' }
    ],
    trendingDiscussions: [
      { id: '1', title: 'Common Flying Dreams', replies: 45, views: 230 },
      { id: '2', title: 'Dream Signs Guide', replies: 32, views: 180 }
    ],
    upcomingEvents: [
      { id: '1', title: 'Lucid Dream Workshop', date: '2024-02-15', participants: 28 },
      { id: '2', title: 'Dream Journaling Tips', date: '2024-02-18', participants: 15 }
    ]
  };

  const renderDiscoverSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Popular Groups */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Popular Dream Circles</h3>
          <TrendingUp className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="space-y-4">
          {featuredContent.popularGroups.map(group => (
            <div key={group.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-sm text-gray-500">{group.members} members</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                group.activity === 'high' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {group.activity} activity
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Discussions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Trending Discussions</h3>
          <MessageCircle className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="space-y-4">
          {featuredContent.trendingDiscussions.map(discussion => (
            <div key={discussion.id} className="space-y-2">
              <p className="font-medium">{discussion.title}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{discussion.replies} replies</span>
                <span>{discussion.views} views</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming Events</h3>
          <CalendarIcon className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="space-y-4">
          {featuredContent.upcomingEvents.map(event => (
            <div key={event.id} className="space-y-2">
              <p className="font-medium">{event.title}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(event.date).toLocaleDateString()}</span>
                <span>{event.participants} attending</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'discover') {
      return renderDiscoverSection();
    }

    const props = {
      onModAction: handleModAction,
      isModerator: moderationService.canModerateContent(user.id)
    };

    switch (activeTab) {
      case 'categories': return <Categories {...props} />;
      case 'interpretations': return <Interpretations {...props} />;
      case 'polls': return <Polls {...props} />;
      case 'mentorship': return <Mentorship {...props} />;
      case 'events': return <Events {...props} />;
      case 'groups': return <Groups {...props} />;
      case 'guidelines': return <Guidelines />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Your Dreams</span>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold mt-2">23</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Interpretations</span>
            <MessageCircle className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold mt-2">12</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Reputation</span>
            <Star className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold mt-2">450</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Notifications</span>
            <Bell className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold mt-2">3</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {mainTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}