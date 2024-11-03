import React, { useState } from 'react';
import { Shield, Users, Settings, AlertTriangle, Database, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { moderationService } from '../services/moderationService';
import ModeratorManagement from '../components/admin/ModeratorManagement';

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users' | 'mods' | 'settings'>('overview');

  const reports = moderationService.getReports();
  const pendingReports = reports.filter(r => r.status === 'pending');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Database },
    { id: 'reports', label: 'Reports', icon: Flag, count: pendingReports.length },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'mods', label: 'Moderators', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleReportAction = async (reportId: string, action: 'warn' | 'mute' | 'ban' | 'delete') => {
    await moderationService.resolveReport(reportId, user.id, action);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === tab.id
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <tab.icon className="h-5 w-5 mr-2" />
            <span>{tab.label}</span>
            {tab.count && tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Pending Reports</h3>
              <p className="text-3xl font-bold text-indigo-600">{pendingReports.length}</p>
            </div>
            {/* Add more stats */}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      report.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mb-2">{report.description}</p>
                {report.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReportAction(report.id, 'warn')}
                      className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-lg"
                    >
                      Warn
                    </button>
                    <button
                      onClick={() => handleReportAction(report.id, 'mute')}
                      className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg"
                    >
                      Mute
                    </button>
                    <button
                      onClick={() => handleReportAction(report.id, 'ban')}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg"
                    >
                      Ban
                    </button>
                    <button
                      onClick={() => handleReportAction(report.id, 'delete')}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg"
                    >
                      Delete Content
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mods' && <ModeratorManagement />}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="font-medium">Maintenance Mode</h3>
                <p className="text-sm text-gray-500">Temporarily disable access for non-admin users</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                Enable
              </button>
            </div>
            {/* Add more settings */}
          </div>
        )}
      </div>
    </div>
  );
} 