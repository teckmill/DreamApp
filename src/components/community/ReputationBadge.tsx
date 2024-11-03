import React from 'react';
import { Award, Star, Shield, Crown } from 'lucide-react';

interface ReputationBadgeProps {
  level: number;
  points: number;
  badges: string[];
  role: 'member' | 'interpreter' | 'moderator' | 'expert';
}

export default function ReputationBadge({ level, points, badges, role }: ReputationBadgeProps) {
  const getRoleIcon = () => {
    switch (role) {
      case 'interpreter': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'moderator': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'expert': return <Crown className="h-4 w-4 text-purple-500" />;
      default: return <Award className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {getRoleIcon()}
      <div className="text-sm">
        <span className="font-medium">Level {level}</span>
        <span className="text-gray-500"> • {points} points</span>
      </div>
      <div className="flex space-x-1">
        {badges.map((badge, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
} 