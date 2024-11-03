import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, UserMinus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { moderationService, ModeratorRole } from '../../services/moderationService';

export default function ModeratorManagement() {
  const { user } = useAuth();
  const [moderators, setModerators] = useState(moderationService.getModerators());
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState<ModeratorRole>('moderator');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canAssignMods = moderationService.canAssignModerators(user.id);

  useEffect(() => {
    loadModerators();
  }, []);

  const loadModerators = () => {
    setModerators(moderationService.getModerators());
  };

  const handleAssignModerator = async () => {
    try {
      if (!selectedUser) return;
      
      await moderationService.assignModerator(selectedUser, selectedRole, user.id);
      setSuccess('Moderator assigned successfully');
      setSelectedUser('');
      loadModerators();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleRemoveModerator = async (userId: string) => {
    try {
      await moderationService.removeModerator(userId, user.id);
      setSuccess('Moderator removed successfully');
      loadModerators();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (!canAssignMods) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
          <p className="text-yellow-700 dark:text-yellow-400">
            You don't have permission to manage moderators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assign New Moderator */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Assign New Moderator</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select User</label>
            <input
              type="text"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              placeholder="Enter user ID"
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ModeratorRole)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="moderator">Moderator</option>
              <option value="community_manager">Community Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handleAssignModerator}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Assign Moderator
          </button>
        </div>
      </div>

      {/* Current Moderators */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Current Moderators</h2>
        
        <div className="space-y-4">
          {moderators.map(mod => (
            <div key={mod.userId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <div className="font-medium">{mod.userId}</div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Shield className="h-4 w-4 inline mr-1" />
                  {mod.role}
                </div>
              </div>
              
              <button
                onClick={() => handleRemoveModerator(mod.userId)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
              >
                <UserMinus className="h-5 w-5" />
              </button>
            </div>
          ))}

          {moderators.length === 0 && (
            <p className="text-center text-gray-500">No moderators assigned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
} 