import React, { useState } from 'react';
import { Shield, Lock, Key, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { systemService } from '../../services/systemService';
import { moderationService } from '../../services/moderationService';

export default function SecuritySettings() {
  const [settings, setSettings] = useState({
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    sessionTimeout: 60, // minutes
    passwordMinLength: 8,
    twoFactorEnabled: false,
    autobanThreshold: 3, // reports
    contentFilter: 'moderate', // strict, moderate, light
    ipBlacklist: [] as string[],
    suspiciousActivityThreshold: 'medium' // high, medium, low
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSettingChange = async (key: string, value: any) => {
    try {
      setLoading(true);
      await systemService.updateSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update settings');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSessions = async () => {
    if (window.confirm('Are you sure? This will log out all users.')) {
      // Implement session reset logic
    }
  };

  const handleUpdateSecurityRules = async () => {
    // Implement security rules update logic
  };

  return (
    <div className="space-y-8">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Security Status</h3>
            <Shield className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold mb-2">Strong</p>
          <p className="text-sm text-gray-500">All systems operational</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Sessions</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold mb-2">247</p>
          <button
            onClick={handleResetSessions}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Force Logout All
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Threats Blocked</h3>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold mb-2">18</p>
          <p className="text-sm text-gray-500">Last 24 hours</p>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-6">Security Configuration</h3>
        
        <div className="space-y-6">
          {/* Authentication */}
          <div>
            <h4 className="font-medium mb-4">Authentication</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Maximum Login Attempts</label>
                <select
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('maxLoginAttempts', Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="3">3 attempts</option>
                  <option value="5">5 attempts</option>
                  <option value="10">10 attempts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                  min="5"
                  max="1440"
                />
              </div>
            </div>
          </div>

          {/* Content Security */}
          <div>
            <h4 className="font-medium mb-4">Content Security</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Content Filter Level</label>
                <select
                  value={settings.contentFilter}
                  onChange={(e) => handleSettingChange('contentFilter', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="strict">Strict</option>
                  <option value="moderate">Moderate</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Auto-ban Threshold (reports)</label>
                <input
                  type="number"
                  value={settings.autobanThreshold}
                  onChange={(e) => handleSettingChange('autobanThreshold', Number(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Advanced Security */}
          <div>
            <h4 className="font-medium mb-4">Advanced Security</h4>
            <div className="space-y-4">
              <button
                onClick={handleUpdateSecurityRules}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Update Security Rules</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 