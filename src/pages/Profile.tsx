import React from 'react';
import { Settings, LineChart, Calendar, Award, BookOpen, MessageCircle, Heart } from 'lucide-react';

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center sm:space-x-6">
          <div className="-mt-20 mb-4 sm:mb-0">
            <img
              src="https://i.pravatar.cc/128?img=1"
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
            />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dream Explorer</h1>
            <p className="text-gray-600 dark:text-gray-300">Exploring the dream realm since 2024</p>
          </div>
          <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            Dream Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Total Dreams</span>
              <span className="font-semibold text-gray-900 dark:text-white">42</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">This Month</span>
              <span className="font-semibold text-gray-900 dark:text-white">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Lucid Dreams</span>
              <span className="font-semibold text-gray-900 dark:text-white">8</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            Achievements
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {['Dream Master', 'Lucid Explorer', 'Social Dreamer', 'Pattern Finder'].map((achievement) => (
              <div
                key={achievement}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-200">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            { icon: BookOpen, text: 'Recorded a new dream', time: '2 hours ago' },
            { icon: Award, text: 'Earned "Pattern Finder" badge', time: '1 day ago' },
            { icon: MessageCircle, text: 'Commented on "Flying Dreams"', time: '2 days ago' },
            { icon: Heart, text: 'Liked "The Infinite Library"', time: '3 days ago' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <activity.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                <span className="text-gray-700 dark:text-gray-200">{activity.text}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}