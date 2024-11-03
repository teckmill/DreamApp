import React, { useState } from 'react';
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
            {/* User rows */}
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