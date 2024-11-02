import React, { useState, useEffect } from 'react';
import { Users, Award, Settings, BarChart, AlertTriangle, Search, Filter, RefreshCw, Lock, Globe, Database, Gift, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_TIERS, subscriptionService } from '../services/subscriptionService';
import { rewardService } from '../services/rewardService';
import { adService } from '../services/adService';
import { systemService } from '../services/systemService';

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

interface ReportedContent {
  id: string;
  type: 'post' | 'comment';
  content: string;
  reportedBy: string;
  reportedAt: Date;
  originalContent: any;
  reason?: string;
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
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>(() => {
    const reports = localStorage.getItem('dreamscape_reported_content');
    if (reports) {
      return JSON.parse(reports).map((report: any) => ({
        ...report,
        reportedAt: new Date(report.reportedAt)
      }));
    }
    return [];
  });
  const [systemSettings, setSystemSettings] = useState(systemService.getSettings());
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const loadReports = () => {
      const reports = localStorage.getItem('dreamscape_reported_content');
      if (reports) {
        setReportedContent(JSON.parse(reports).map((report: any) => ({
          ...report,
          reportedAt: new Date(report.reportedAt)
        })));
      }
    };

    loadReports();
    // Refresh reports every minute
    const interval = setInterval(loadReports, 60000);
    return () => clearInterval(interval);
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
    try {
      const report = reportedContent.find(r => r.id === contentId);
      if (!report) return;

      if (action === 'delete') {
        // Remove the original content
        if (report.type === 'post') {
          const posts = JSON.parse(localStorage.getItem('dreamscape_community_posts') || '[]');
          const updatedPosts = posts.filter((post: any) => post.id !== report.originalContent.id);
          localStorage.setItem('dreamscape_community_posts', JSON.stringify(updatedPosts));
        }
      }

      // Remove the report
      const updatedReports = reportedContent.filter(r => r.id !== contentId);
      setReportedContent(updatedReports);
      localStorage.setItem('dreamscape_reported_content', JSON.stringify(updatedReports));

      setSuccess(`Content ${action === 'approve' ? 'approved' : 'removed'} successfully`);
    } catch (error) {
      setError('Failed to process content action');
      console.error('Content action error:', error);
    }
  };

  // System Settings Functions
  const handleSettingChange = (setting: string, value: any) => {
    const newSettings = {
      ...systemSettings,
      [setting]: value
    };
    setSystemSettings(newSettings);
    systemService.saveSettings(newSettings);

    // Show success message
    setSuccess(`Successfully updated ${setting}`);

    // Apply immediate effects
    if (setting === 'maintenanceMode') {
      // Force reload for maintenance mode changes
      window.location.reload();
    }
  };

  // Enhanced reward management function
  const handleRewardAction = async (userId: string, action: 'grant' | 'revoke', rewardType: string, amount: number) => {
    try {
      if (action === 'grant') {
        await rewardService.addReward(userId, {
          type: rewardType as any,
          amount,
          source: 'achievement'
        });
      } else {
        // Revoke rewards
        await rewardService.removeReward(userId, {
          type: rewardType as any,
          amount
        });
      }

      // Refresh users list to update displayed rewards
      loadUsers();
      
      setSuccess(`Successfully ${action}ed ${amount} ${rewardType.replace('_', ' ')} ${action === 'grant' ? 'to' : 'from'} user`);
    } catch (error) {
      setError(`Failed to ${action} reward`);
      console.error(`Error ${action}ing reward:`, error);
    }
  };

  // Add function to handle subscription changes
  const handleSubscriptionChange = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'remove_premium':
          await subscriptionService.removePremium(userId);
          break;
        case 'remove_all_rewards':
          await rewardService.removeAllRewards(userId);
          break;
        default:
          await subscriptionService.upgradeTier(userId, action.replace('upgrade_', '') as any);
          break;
      }
      loadUsers();
      setSuccess('Successfully updated user subscription');
    } catch (error) {
      setError('Failed to update subscription');
      console.error('Error updating subscription:', error);
    }
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

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Reported Content</h3>
            {reportedContent.length > 0 ? (
              reportedContent.map((content) => (
                <div key={content.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          content.type === 'post' 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {content.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          Reported {new Date(content.reportedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">
                        Content:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {content.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reported by: {content.reportedBy}
                      </p>
                      {content.reason && (
                        <p className="text-xs text-gray-500">
                          Reason: {content.reason}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleContentAction(content.id, 'approve')}
                        className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleContentAction(content.id, 'delete')}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reported content to review
              </div>
            )}
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

            <div>
              <h3 className="font-medium mb-2">Maximum Posts per User</h3>
              <input
                type="number"
                value={systemSettings.maxPostsPerUser}
                onChange={(e) => handleSettingChange('maxPostsPerUser', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
                min="1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Require Email Verification</h3>
                <p className="text-sm text-gray-500">Users must verify email before accessing features</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.requireEmailVerification}
                  onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
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
                        onClick={() => handleContentAction(content.id, 'delete')}
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
            <h3 className="text-lg font-semibold mb-4">Manage User Rewards</h3>
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
                    <label className="block text-sm font-medium mb-2">Reward Action</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="w-full p-2 border rounded-lg"
                        onChange={(e) => {
                          const [action, type, amount] = e.target.value.split('|');
                          handleRewardAction(selectedUserId, action as 'grant' | 'revoke', type, parseInt(amount));
                        }}
                      >
                        <option value="">Grant Reward</option>
                        <option value="grant|premium_time|24">Add 24h Premium</option>
                        <option value="grant|analysis_credits|5">Add 5 Credits</option>
                        <option value="grant|dream_tokens|100">Add 100 Tokens</option>
                      </select>
                      <select
                        className="w-full p-2 border rounded-lg"
                        onChange={(e) => {
                          const [action, type, amount] = e.target.value.split('|');
                          handleRewardAction(selectedUserId, action as 'grant' | 'revoke', type, parseInt(amount));
                        }}
                      >
                        <option value="">Remove Reward</option>
                        <option value="revoke|premium_time|24">Remove 24h Premium</option>
                        <option value="revoke|analysis_credits|5">Remove 5 Credits</option>
                        <option value="revoke|dream_tokens|100">Remove 100 Tokens</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Subscription Actions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="w-full p-2 border rounded-lg"
                        onChange={(e) => handleSubscriptionChange(selectedUserId, e.target.value)}
                      >
                        <option value="">Manage Subscription</option>
                        <option value="upgrade_premium">Upgrade to Premium</option>
                        <option value="upgrade_pro">Upgrade to Pro</option>
                        <option value="remove_premium">Remove Premium Status</option>
                        <option value="remove_all_rewards">Remove All Rewards</option>
                      </select>
                    </div>
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