import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, Database, Flag, Activity, Lock, Gift, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { moderationService } from '../services/moderationService';
import { systemService, type SystemSettings, type SystemStats } from '../services/systemService';
import { rewardService } from '../services/rewardService';
import { subscriptionService } from '../services/subscriptionService';
import UserManagement from '../components/admin/UserManagement';
import ContentModeration from '../components/admin/ContentModeration';
import SecuritySettings from '../components/admin/SecuritySettings';
import SystemAnalytics from '../components/admin/SystemAnalytics';
import ActivityLogs from '../components/admin/ActivityLogs';
import ModeratorManagement from '../components/admin/ModeratorManagement';

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDreams: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    reportedContent: 0
  });

  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    adCooldownPeriod: 30,
    maxDreamsPerUser: 100
  });

  useEffect(() => {
    if (!user || user.email !== 'teckmillion17@gmail.com') {
      window.location.href = '/';
      return;
    }
    loadSystemStats();
    loadSettings();
  }, [user]);

  const loadSystemStats = () => {
    // Load stats from various services
    const stats = systemService.getSystemStats();
    setSystemStats(stats);
  };

  const loadSettings = () => {
    const currentSettings = systemService.getSettings();
    setSettings(currentSettings);
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: Database },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Moderation', icon: Flag },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
    { id: 'mods', label: 'Moderators', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const handleSettingChange = async (key: keyof SystemSettings, value: SystemSettings[typeof key]) => {
    try {
      await systemService.updateSetting(key, value);
      setSettings((prev: SystemSettings) => ({ ...prev, [key]: value }));
      loadSystemStats();
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'ban':
          await moderationService.banUser(userId);
          break;
        case 'unban':
          await moderationService.unbanUser(userId);
          break;
        case 'promote':
          await moderationService.assignModerator(userId, 'moderator', user.id);
          break;
        case 'delete':
          await systemService.deleteUser(userId);
          break;
      }
      loadSystemStats();
    } catch (error) {
      console.error('Failed to perform user action:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SystemAnalytics />;
      case 'users':
        return <UserManagement />;
      case 'content':
        return <ContentModeration />;
      case 'security':
        return <SecuritySettings />;
      case 'logs':
        return <ActivityLogs />;
      case 'mods':
        return <ModeratorManagement />;
      case 'settings':
        return (
          <div className="space-y-6">
            {/* System Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">System Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Disable access for non-admin users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Registration</p>
                    <p className="text-sm text-gray-500">Enable new user registration</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowRegistration}
                      onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ad Cooldown Period (seconds)</label>
                  <input
                    type="number"
                    value={settings.adCooldownPeriod}
                    onChange={(e) => handleSettingChange('adCooldownPeriod', parseInt(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Dreams Per User</label>
                  <input
                    type="number"
                    value={settings.maxDreamsPerUser}
                    onChange={(e) => handleSettingChange('maxDreamsPerUser', parseInt(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
          <button
            onClick={loadSystemStats}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
          >
            <Activity className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Users</h3>
          <p className="text-3xl font-bold">{systemStats.totalUsers}</p>
          <p className="text-sm text-green-500 mt-2">
            {systemStats.activeUsers} active today
          </p>
        </div>
        {/* Add more stat cards */}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="h-5 w-5 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {renderTabContent()}
      </div>
    </div>
  );
} 