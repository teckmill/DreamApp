import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, Database, Flag, Activity, Lock, Gift, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { moderationService } from '../services/moderationService';
import { systemService, type SystemSettings, type SystemStats } from '../services/systemService';
import { rewardService } from '../services/rewardService';
import { subscriptionService } from '../services/subscriptionService';
import UserManagement from '../components/admin/UserManagement';

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
    { id: 'subscriptions', label: 'Subscriptions', icon: Gift },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const handleSettingChange = async (key: keyof SystemSettings, value: SystemSettings[keyof SystemSettings]) => {
    try {
      await systemService.updateSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
      // Refresh stats if needed
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
      <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
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
        {/* Add tab content components */}
      </div>
    </div>
  );
} 