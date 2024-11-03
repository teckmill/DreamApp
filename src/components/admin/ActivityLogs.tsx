import React, { useState, useEffect } from 'react';
import { Clock, Filter, Download, Search, AlertTriangle, Shield, User, Settings } from 'lucide-react';
import { moderationService } from '../../services/moderationService';

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  category: 'auth' | 'content' | 'admin' | 'system' | 'security';
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    severity: 'all',
    category: 'all',
    timeRange: '24h'
  });

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchQuery, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // Get moderation logs
      const modLogs = moderationService.getModLogs();
      
      // Convert mod logs to activity logs format
      const activityLogs: ActivityLog[] = modLogs.map(log => ({
        id: log.id,
        userId: log.userId,
        action: log.action,
        details: log.reason,
        ipAddress: 'N/A',
        userAgent: 'N/A',
        timestamp: new Date(log.createdAt),
        severity: log.action === 'ban' ? 'high' : 'medium',
        category: 'admin'
      }));

      setLogs(activityLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(log => log.category === filters.category);
    }

    // Apply severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    // Apply time range filter
    const now = new Date();
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    if (filters.timeRange in timeRanges) {
      filtered = filtered.filter(log => 
        now.getTime() - new Date(log.timestamp).getTime() <= timeRanges[filters.timeRange as keyof typeof timeRanges]
      );
    }

    setFilteredLogs(filtered);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border"
            />
          </div>
        </div>
        
        <select
          value={filters.severity}
          onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="all">All Categories</option>
          <option value="auth">Authentication</option>
          <option value="content">Content</option>
          <option value="admin">Admin</option>
          <option value="system">System</option>
          <option value="security">Security</option>
        </select>

        <select
          value={filters.timeRange}
          onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      log.severity === 'high' ? 'bg-red-100 text-red-700' :
                      log.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 