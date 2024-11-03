import React, { useState, useEffect } from 'react';
import { Lock, Users, Eye, EyeOff, Clock, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sharingService, SharingPermission } from '../../services/sharingService';

interface SharingSettingsModalProps {
  contentId: string;
  contentType: 'dream' | 'interpretation' | 'analysis';
  onClose: () => void;
}

export default function SharingSettingsModal({ contentId, contentType, onClose }: SharingSettingsModalProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(sharingService.getUserSettings(user.id));
  const [permission, setPermission] = useState<SharingPermission>('private');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [expirationHours, setExpirationHours] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const permissionOptions = [
    { value: 'private', label: 'Private', icon: Lock },
    { value: 'public', label: 'Public', icon: Eye },
    { value: 'mentors', label: 'Mentors Only', icon: Users },
    { value: 'groups', label: 'Specific Groups', icon: Users },
    { value: 'selected', label: 'Selected Users', icon: UserPlus }
  ];

  const handleShare = () => {
    const sharedWith = permission === 'selected' ? selectedUsers :
                      permission === 'groups' ? selectedGroups : [];

    sharingService.shareContent(
      user.id,
      contentType,
      contentId,
      permission,
      sharedWith,
      expirationHours
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Sharing Settings</h3>
          <button onClick={onClose} className="text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Permission Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Who can see this?</label>
            <div className="space-y-2">
              {permissionOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setPermission(option.value as SharingPermission)}
                  className={`w-full flex items-center p-3 rounded-lg border ${
                    permission === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <option.icon className="h-5 w-5 mr-3 text-gray-500" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User/Group Selection */}
          {(permission === 'selected' || permission === 'groups') && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {permission === 'selected' ? 'Select Users' : 'Select Groups'}
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder={`Search ${permission === 'selected' ? 'users' : 'groups'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {/* Add user/group list here */}
                </div>
              </div>
            </div>
          )}

          {/* Expiration Setting */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Expiration
              </div>
            </label>
            <select
              value={expirationHours || ''}
              onChange={(e) => setExpirationHours(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Never</option>
              <option value="24">24 hours</option>
              <option value="72">3 days</option>
              <option value="168">1 week</option>
              <option value="720">1 month</option>
            </select>
          </div>

          {/* Default Settings */}
          <div className="pt-4 border-t">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.anonymousSharing}
                onChange={(e) => {
                  const newSettings = {
                    ...settings,
                    anonymousSharing: e.target.checked
                  };
                  setSettings(newSettings);
                  sharingService.saveUserSettings(user.id, newSettings);
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Share anonymously</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 