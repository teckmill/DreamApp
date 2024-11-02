import React, { useState } from 'react';
import { Settings, LineChart, Calendar, Award, BookOpen, MessageCircle, Heart, Edit, Save, X, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services/subscriptionService';
import { rewardService } from '../services/rewardService';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.username || '');
  const [editedBio, setEditedBio] = useState(user?.bio || '');
  const currentTier = subscriptionService.getUserSubscription(user.id);
  const userRewards = rewardService.getUserRewards(user.id);

  // Mock data - in a real app, this would come from your backend
  const stats = {
    dreamsRecorded: 0,
    communityPosts: 0,
    likesReceived: 0,
    streak: 0,
    joinedDate: new Date().toLocaleDateString(),
    lastActive: 'Today'
  };

  const handleSaveProfile = () => {
    // In a real app, you'd update the user profile in your backend
    setIsEditing(false);
  };

  const achievements = [
    { name: 'Dream Logger', description: 'Record your first dream', completed: false },
    { name: 'Dream Explorer', description: 'Record 10 dreams', completed: false },
    { name: 'Community Member', description: 'Make your first post', completed: false },
    { name: 'Dream Analyst', description: 'Analyze 5 dreams', completed: false },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          {isEditing ? (
            <div className="flex-1">
              <input
                type="text"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                className="text-2xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 mb-2 w-full"
                placeholder="Username"
              />
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="w-full bg-transparent border rounded-lg p-2 text-gray-600 dark:text-gray-300"
                placeholder="Write a short bio..."
                rows={3}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-1 text-green-600 dark:text-green-400"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-1 text-red-600 dark:text-red-400"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.username}
                </h1>
                {currentTier.name !== 'Basic' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <Crown className="h-4 w-4 mr-1" />
                    {currentTier.name}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{editedBio || 'No bio yet'}</p>
            </div>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>

        {currentTier.name !== 'Basic' && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <h3 className="font-medium text-indigo-600 dark:text-indigo-400 mb-2">
              Premium Benefits Active
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Premium Time Left: {userRewards.premiumTimeLeft} hours
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Analysis Credits: {userRewards.analysisCredits}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Dream Tokens: {userRewards.dreamTokens}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Dreams Recorded</span>
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.dreamsRecorded}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Community Posts</span>
              <MessageCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.communityPosts}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">Likes Received</span>
              <Heart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.likesReceived}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">Member since {stats.joinedDate}</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">Last active: {stats.lastActive}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <Award className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            Achievements
          </h2>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  achievement.completed
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.completed && (
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
            Dream Stats
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300">Current Streak</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.streak} days
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-center py-8">
              Start recording dreams to see more stats
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}