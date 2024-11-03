interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'dreams' | 'community' | 'mentorship' | 'analysis';
  requirement: {
    type: 'count' | 'streak' | 'rating' | 'level';
    value: number;
  };
  reward: {
    type: 'dream_tokens' | 'analysis_credits' | 'premium_time';
    amount: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
  progress: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_dream',
    name: 'Dream Recorder',
    description: 'Record your first dream',
    icon: '📝',
    category: 'dreams',
    requirement: { type: 'count', value: 1 },
    reward: { type: 'dream_tokens', amount: 100 },
    rarity: 'common'
  },
  {
    id: 'dream_streak',
    name: 'Dream Keeper',
    description: 'Maintain a 7-day dream recording streak',
    icon: '🔥',
    category: 'dreams',
    requirement: { type: 'streak', value: 7 },
    reward: { type: 'analysis_credits', amount: 3 },
    rarity: 'rare'
  },
  {
    id: 'community_helper',
    name: 'Dream Guide',
    description: 'Help interpret 10 dreams',
    icon: '🌟',
    category: 'community',
    requirement: { type: 'count', value: 10 },
    reward: { type: 'premium_time', amount: 24 },
    rarity: 'epic'
  },
  {
    id: 'master_analyst',
    name: 'Dream Master',
    description: 'Reach level 10 in dream analysis',
    icon: '👑',
    category: 'analysis',
    requirement: { type: 'level', value: 10 },
    reward: { type: 'dream_tokens', amount: 1000 },
    rarity: 'legendary'
  }
];

export const achievementService = {
  getUserAchievements(userId: string): UserAchievement[] {
    const achievements = localStorage.getItem(`achievements_${userId}`);
    return achievements ? JSON.parse(achievements) : [];
  },

  saveUserAchievements(userId: string, achievements: UserAchievement[]): void {
    localStorage.setItem(`achievements_${userId}`, JSON.stringify(achievements));
  },

  async checkAchievements(userId: string): Promise<Achievement[]> {
    const userAchievements = this.getUserAchievements(userId);
    const unlockedAchievements: Achievement[] = [];

    // Get user stats
    const dreams = JSON.parse(localStorage.getItem(`dreams_${userId}`) || '[]');
    const interpretations = JSON.parse(localStorage.getItem(`interpretations_${userId}`) || '[]');
    const userLevel = JSON.parse(localStorage.getItem(`user_level_${userId}`) || '1');

    for (const achievement of ACHIEVEMENTS) {
      const existing = userAchievements.find(a => a.achievementId === achievement.id);
      if (existing) continue;

      let progress = 0;
      switch (achievement.category) {
        case 'dreams':
          if (achievement.requirement.type === 'count') {
            progress = dreams.length;
          } else if (achievement.requirement.type === 'streak') {
            progress = this.calculateStreak(dreams);
          }
          break;
        case 'community':
          if (achievement.requirement.type === 'count') {
            progress = interpretations.length;
          }
          break;
        case 'analysis':
          if (achievement.requirement.type === 'level') {
            progress = userLevel;
          }
          break;
      }

      if (progress >= achievement.requirement.value) {
        unlockedAchievements.push(achievement);
        userAchievements.push({
          achievementId: achievement.id,
          unlockedAt: new Date(),
          progress
        });

        // Grant reward
        await this.grantAchievementReward(userId, achievement.reward);
      }
    }

    this.saveUserAchievements(userId, userAchievements);
    return unlockedAchievements;
  },

  calculateStreak(dreams: any[]): number {
    if (dreams.length === 0) return 0;
    
    let streak = 1;
    let currentDate = new Date(dreams[0].date);
    
    for (let i = 1; i < dreams.length; i++) {
      const dreamDate = new Date(dreams[i].date);
      const diffDays = Math.floor((currentDate.getTime() - dreamDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = dreamDate;
      } else {
        break;
      }
    }
    
    return streak;
  },

  async grantAchievementReward(userId: string, reward: Achievement['reward']): Promise<void> {
    await rewardService.addReward(userId, {
      type: reward.type,
      amount: reward.amount,
      source: 'achievement'
    });
  }
}; 