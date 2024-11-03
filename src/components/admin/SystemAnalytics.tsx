import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, Clock, Calendar, Activity } from 'lucide-react';
import { systemService } from '../../services/systemService';
import { subscriptionService } from '../../services/subscriptionService';

interface AnalyticsPeriod {
  users: number;
  dreams: number;
  interactions: number;
  revenue: number;
  date: string;
}

export default function SystemAnalytics() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [analytics, setAnalytics] = useState<AnalyticsPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  const [insights, setInsights] = useState({
    userGrowth: 0,
    retentionRate: 0,
    averageDreamsPerUser: 0,
    premiumConversion: 0,
    activeUsers: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get system stats
      const stats = systemService.getSystemStats();
      const users = JSON.parse(localStorage.getItem('dreamscape_users') || '[]');
      const totalDreams = stats.totalDreams;

      // Calculate insights
      const newInsights = {
        userGrowth: calculateUserGrowth(users),
        retentionRate: calculateRetentionRate(users),
        averageDreamsPerUser: users.length ? totalDreams / users.length : 0,
        premiumConversion: (stats.premiumUsers / users.length) * 100 || 0,
        activeUsers: stats.activeUsers,
        totalRevenue: stats.totalRevenue
      };

      setInsights(newInsights);

      // Generate time-based analytics
      const periods = generateAnalyticsPeriods(timeframe);
      setAnalytics(periods);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserGrowth = (users: any[]) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const newUsers = users.filter(u => new Date(u.createdAt).getTime() > thirtyDaysAgo).length;
    return (newUsers / users.length) * 100 || 0;
  };

  const calculateRetentionRate = (users: any[]) => {
    const activeUsers = users.filter(u => {
      const lastActive = new Date(u.lastActive).getTime();
      return Date.now() - lastActive < 7 * 24 * 60 * 60 * 1000;
    }).length;
    return (activeUsers / users.length) * 100 || 0;
  };

  const generateAnalyticsPeriods = (timeframe: string): AnalyticsPeriod[] => {
    // Generate mock data for demonstration
    const periods: AnalyticsPeriod[] = [];
    const now = new Date();
    
    const daysToGenerate = timeframe === 'day' ? 24 : 
                          timeframe === 'week' ? 7 :
                          timeframe === 'month' ? 30 : 12;

    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      periods.unshift({
        users: Math.floor(Math.random() * 100),
        dreams: Math.floor(Math.random() * 200),
        interactions: Math.floor(Math.random() * 500),
        revenue: Math.floor(Math.random() * 1000),
        date: date.toISOString().split('T')[0]
      });
    }

    return periods;
  };

  return (
    <div className="space-y-8">
      {/* Timeframe Selection */}
      <div className="flex gap-4">
        {['day', 'week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setTimeframe(period as any)}
            className={`px-4 py-2 rounded-lg ${
              timeframe === period
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">User Growth</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold mb-2">{insights.userGrowth.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Last 30 days</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Retention Rate</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold mb-2">{insights.retentionRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">7-day retention</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Premium Conversion</h3>
            <Activity className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold mb-2">{insights.premiumConversion.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Of total users</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-6">Activity Overview</h3>
        <div className="h-64">
          {/* Add chart visualization here */}
          <div className="flex h-full items-end space-x-2">
            {analytics.map((period, index) => (
              <div
                key={index}
                className="flex-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-t"
                style={{ height: `${(period.dreams / 200) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 