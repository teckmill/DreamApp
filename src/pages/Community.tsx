import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import Categories from './Community/Categories';
import Interpretations from './Community/Interpretations';
import Polls from './Community/Polls';
import Mentorship from './Community/Mentorship';
import Events from './Community/Events';
import Groups from './Community/Groups';
import Guidelines from './Community/Guidelines';
import { useAuth } from '../context/AuthContext';
import { Bell, MessageCircle, Users, Star } from 'lucide-react';

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');

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

      {/* Main Content */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <TabsList className="flex space-x-2 mb-6 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="interpretations">Interpretations</TabsTrigger>
            <TabsTrigger value="polls">Polls</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="categories">
              <Categories />
            </TabsContent>
            <TabsContent value="interpretations">
              <Interpretations />
            </TabsContent>
            <TabsContent value="polls">
              <Polls />
            </TabsContent>
            <TabsContent value="mentorship">
              <Mentorship />
            </TabsContent>
            <TabsContent value="events">
              <Events />
            </TabsContent>
            <TabsContent value="groups">
              <Groups />
            </TabsContent>
            <TabsContent value="guidelines">
              <Guidelines />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}