import React, { useState, useEffect } from 'react';
import { Users, Award, Settings, BarChart, AlertTriangle, Search, Filter, RefreshCw, Lock, Globe, Database, Gift, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_TIERS, subscriptionService } from '../services/subscriptionService';
import { rewardService } from '../services/rewardService';
import { adService } from '../services/adService';

interface UserStats {
  totalUsers: number;
  premiumUsers: number;
  proUsers: number;
  activeToday: number;
}

interface SystemStats {
  totalDreams: number;
  totalPosts: number;
  totalAdsWatched: number;
  totalRewards: number;
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'reports' | 'settings' | 'content' | 'rewards'>('overview');
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    premiumUsers: 0,
    proUsers: 0,
    activeToday: 0
  });
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalDreams: 0,
    totalPosts: 0,
    totalAdsWatched: 0,
    totalRewards: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [reportedContent, setReportedContent] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState({
    allowNewRegistrations: true,
    maintenanceMode: false,
    adCooldownPeriod: 1, // hours
    maxDreamsPerUser: 100,
    maxPostsPerUser: 50,
    requireEmailVerification: true
  });
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Load all users
      const users = JSON.parse(localStorage.getItem('dreamscape_users') || '[]');
      const premiumCount = users.filter((u: any) => 
        subscriptionService.getUserSubscription(u.id).name === 'Premium'
      ).length;
      const proCount = users.filter((u: any) => 
        subscriptionService.getUserSubscription(u.id).name === 'Professional'
      ).length;

      // Get system stats
      const allDreams = users.reduce((acc: number, u: any) => {
        const userDreams = JSON.parse(localStorage.getItem(`dreams_${u.id}`) || '[]');
        return acc + userDreams.length;
      }, 0);

      const allPosts = JSON.parse(localStorage.getItem('dreamscape_community_posts') || '[]').length;

      // Calculate total ads and rewards
      const totalAds = users.reduce((acc: number, u: any) => {
        const adHistory = adService.getAdHistory(u.id);
        return acc + adHistory.totalAdsWatched;
      }, 0);

      // Calculate total rewards given
      const totalRewards = users.reduce((acc: number, u: any) => {
        const adHistory = adService.getAdHistory(u.id);
        return acc + (adHistory.rewards?.length || 0);
      }, 0);

      setUserStats({
        totalUsers: users.length,
        premiumUsers: premiumCount,
        proUsers: proCount,
        activeToday: users.length
      });

      setSystemStats({
        totalDreams: allDreams,
        totalPosts: allPosts,
        totalAdsWatched: totalAds,
        totalRewards: totalRewards
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('dreamscape_users') || '[]');
    setUsers(allUsers.map((user: any) => ({
      ...user,
      subscription: subscriptionService.getUserSubscription(user.id),
      rewards: rewardService.getUserRewards(user.id)
    })));
  };

  // Add function to format feature name
  const formatFeatureName = (feature: string) => {
    return feature
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };

  // User Management Functions
  const handleUserAction = async (userId: string, action: string) => {
    switch (action) {
      case 'upgrade_premium':
        await subscriptionService.upgradeTier(userId, 'premium');
        break;
      case 'upgrade_pro':
        await subscriptionService.upgradeTier(userId, 'pro');
        break;
      case 'downgrade':
        // Reset to basic
        localStorage.removeItem(`subscription_${userId}`);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this user?')) {
          const updatedUsers = users.filter(u => u.id !== userId);
          localStorage.setItem('dreamscape_users', JSON.stringify(updatedUsers));
          setUsers(updatedUsers);
        }
        break;
    }
    loadUsers(); // Refresh user list
  };

  // Content Management Functions
  const handleContentAction = (contentId: string, action: 'approve' | 'reject' | 'delete') => {
    // Implement content moderation actions
  };

  // System Settings Functions
  const handleSettingChange = (setting: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    // In a real app, save to backend
  };

  // Reward Management Functions
  const handleRewardAction = async (userId: string, action: 'grant' | 'revoke', rewardType: string, amount: number) => {
    if (action === 'grant') {
      await rewardService.addReward(userId, {
        type: rewardType as any,
        amount,
        source: 'admin'
      });
    }
    loadUsers(); // Refresh user list
  };

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = userFilter === 'all' ||
      (userFilter === 'premium' && user.subscription.name === 'Premium') ||
      (userFilter === 'pro' && user.subscription.name === 'Professional') ||
      (userFilter === 'basic' && user.subscription.name === 'Basic');

    return matchesSearch && matchesFilter;
  });

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <button
          onClick={loadStats}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors w-full sm:w-auto justify-center"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Navigation Tabs - Scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 mb-8">
        <div className="flex space-x-2 min-w-max">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'overview' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : ''
            }`}
          >
            <BarChart className="h-4 w-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'users'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'subscriptions'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Subscriptions</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'reports'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'settings' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : ''
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>System Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'content' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : ''
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Content Management</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'rewards' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : ''
            }`}
          >
            <Gift className="h-4 w-4" />
            <span>Reward Management</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400">Total Users</h3>
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {userStats.totalUsers}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {userStats.activeToday} active today
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400">Premium Users</h3>
              <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {userStats.premiumUsers + userStats.proUsers}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {userStats.proUsers} pro users
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400">Total Dreams</h3>
              <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {systemStats.totalDreams}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {systemStats.totalPosts} shared
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400">Total Ads</h3>
              <BarChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {systemStats.totalAdsWatched}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {systemStats.totalRewards} rewards given
            </p>
          </div>
        </div>
      )}

      {/* Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
            </div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <option value="all">All Users</option>
              <option value="premium">Premium Users</option>
              <option value="pro">Pro Users</option>
              <option value="basic">Basic Users</option>
            </select>
          </div>

          {/* User list table with horizontal scroll on mobile */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Subscription</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-2">{user.username}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        user.subscription.name === 'Professional'
                          ? 'bg-purple-100 text-purple-600'
                          : user.subscription.name === 'Premium'
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.subscription.name}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <select
                          onChange={(e) => handleUserAction(user.id, e.target.value)}
                          className="px-2 py-1 text-sm border rounded"
                          defaultValue=""
                        >
                          <option value="" disabled>Actions</option>
                          <option value="upgrade_premium">Upgrade to Premium</option>
                          <option value="upgrade_pro">Upgrade to Pro</option>
                          <option value="downgrade">Downgrade to Basic</option>
                          <option value="delete">Delete User</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscription Management */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
              <div key={key} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {tier.description}
                </p>
                <div className="space-y-2">
                  {Object.entries(tier.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {formatFeatureName(feature)}
                      </span>
                      <span className={enabled ? 'text-green-500' : 'text-red-500'}>
                        {enabled ? '✓' : '×'}
                      </span>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Limits</h4>
                    {Object.entries(tier.limits).map(([limit, value]) => (
                      <div key={limit} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatFeatureName(limit)}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {value === -1 ? 'Unlimited' : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports and Flags */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <div className="space-y-4">
            {/* Add sample reported content */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-medium">Reported Post</h3>
                  <p className="text-sm text-gray-500">Sample content...</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-100 text-green-600 rounded-lg">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-100 text-red-600 rounded-lg">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">User Registration</h3>
                <p className="text-sm text-gray-500">Allow new users to register</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.allowNewRegistrations}
                  onChange={(e) => handleSettingChange('allowNewRegistrations', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Maintenance Mode</h3>
                <p className="text-sm text-gray-500">Temporarily disable access for non-admin users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div>
              <h3 className="font-medium mb-2">Ad Cooldown Period (hours)</h3>
              <input
                type="number"
                value={systemSettings.adCooldownPeriod}
                onChange={(e) => handleSettingChange('adCooldownPeriod', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
                min="0"
                max="24"
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">Maximum Dreams per User</h3>
              <input
                type="number"
                value={systemSettings.maxDreamsPerUser}
                onChange={(e) => handleSettingChange('maxDreamsPerUser', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
                min="1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Content Management Tab */}
      {activeTab === 'content' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Reported Content</h3>
            {reportedContent.length > 0 ? (
              reportedContent.map((content, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{content.type}</p>
                      <p className="text-sm text-gray-500">{content.content}</p>
                      <p className="text-xs text-gray-400">Reported by: {content.reportedBy}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleContentAction(content.id, 'approve')}
                        className="px-3 py-1 bg-green-100 text-green-600 rounded-lg"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleContentAction(content.id, 'remove')}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No reported content</p>
            )}
          </div>
        </div>
      )}

      {/* Add Reward Management Tab */}
      {activeTab === 'rewards' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Grant Rewards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select User</label>
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedUserId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reward Type</label>
                    <select
                      className="w-full p-2 border rounded-lg"
                      onChange={(e) => {
                        const type = e.target.value;
                        const amount = type === 'premium_time' ? 24 : 
                                     type === 'analysis_credits' ? 5 : 100;
                        handleRewardAction(selectedUserId, 'grant', type, amount);
                      }}
                    >
                      <option value="">Select reward type</option>
                      <option value="premium_time">Premium Time (24h)</option>
                      <option value="analysis_credits">Analysis Credits (5)</option>
                      <option value="dream_tokens">Dream Tokens (100)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-2">Current Rewards</h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      {users.find(u => u.id === selectedUserId)?.rewards && (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Premium Time</p>
                            <p className="font-medium">
                              {users.find(u => u.id === selectedUserId)?.rewards.premiumTimeLeft}h
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Analysis Credits</p>
                            <p className="font-medium">
                              {users.find(u => u.id === selectedUserId)?.rewards.analysisCredits}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Dream Tokens</p>
                            <p className="font-medium">
                              {users.find(u => u.id === selectedUserId)?.rewards.dreamTokens}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 