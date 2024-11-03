import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, Ban, Trash2, Edit, Eye, Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { moderationService } from '../../services/moderationService';
import { rewardService } from '../../services/rewardService';

export default function UserManagement() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('dreamscape_users') || '[]');
    setUsers(allUsers);
  };

  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!user.username.toLowerCase().includes(searchLower) &&
          !user.email.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    if (filterRole !== 'all') {
      const userRole = moderationService.getModeratorRole(user.id) || 'basic';
      if (userRole !== filterRole) return false;
    }

    if (filterStatus !== 'all') {
      const isBanned = moderationService.isUserBanned(user.id);
      const isMuted = moderationService.isUserMuted(user.id);
      if (filterStatus === 'banned' && !isBanned) return false;
      if (filterStatus === 'muted' && !isMuted) return false;
      if (filterStatus === 'active' && (isBanned || isMuted)) return false;
    }

    return true;
  });

  const handleUserAction = async (userId: string, action: string) => {
    switch(action) {
      case 'ban':
        await moderationService.banUser(userId);
        break;
      case 'unban':
        await moderationService.unbanUser(userId);
        break;
      case 'promote':
        await moderationService.assignModerator(userId, 'moderator', user.id);
        break;
      case 'grant_premium':
        await rewardService.addReward(userId, {
          type: 'premium_time',
          amount: 720, // 30 days
          source: 'admin' as const
        });
        break;
      // Add more actions
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="moderator">Moderators</option>
          <option value="premium">Premium Users</option>
          <option value="basic">Basic Users</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="muted">Muted</option>
        </select>
      </div>

      {/* User List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {moderationService.getModeratorRole(user.id) || 'Basic'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    moderationService.isUserBanned(user.id)
                      ? 'bg-red-100 text-red-700'
                      : moderationService.isUserMuted(user.id)
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {moderationService.isUserBanned(user.id)
                      ? 'Banned'
                      : moderationService.isUserMuted(user.id)
                      ? 'Muted'
                      : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.lastActive || Date.now()).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleUserAction(user.id, 'ban')}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Ban className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleUserAction(user.id, 'promote')}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Shield className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4">
            {/* User details content */}
          </div>
        </div>
      )}
    </div>
  );
} 