import React from 'react';
import { Pin, Lock, Trash2, Flag, Shield } from 'lucide-react';
import { moderationService } from '../../services/moderationService';
import { useAuth } from '../../context/AuthContext';

interface ModeratorControlsProps {
  contentId: string;
  contentType: 'dream' | 'comment' | 'interpretation' | 'poll' | 'event' | 'group';
  isPinned?: boolean;
  isLocked?: boolean;
  onPin: () => void;
  onLock: () => void;
  onDelete: () => void;
}

export default function ModeratorControls({
  contentId,
  contentType,
  isPinned,
  isLocked,
  onPin,
  onLock,
  onDelete
}: ModeratorControlsProps) {
  const { user } = useAuth();
  const canModerate = moderationService.canModerateContent(user.id);

  if (!canModerate) return null;

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onPin}
        className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
          isPinned ? 'text-yellow-500' : 'text-gray-500'
        }`}
        title={isPinned ? 'Unpin' : 'Pin'}
      >
        <Pin className="h-4 w-4" />
      </button>
      
      <button
        onClick={onLock}
        className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
          isLocked ? 'text-red-500' : 'text-gray-500'
        }`}
        title={isLocked ? 'Unlock' : 'Lock'}
      >
        <Lock className="h-4 w-4" />
      </button>
      
      <button
        onClick={onDelete}
        className="p-1 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
} 