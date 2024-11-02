interface AdReward {
  type: 'premium_time' | 'analysis_credits' | 'theme_unlock' | 'dream_tokens';
  amount: number;
  duration?: number; // in seconds for ad duration
}

interface AdHistory {
  userId: string;
  rewards: {
    type: string;
    amount: number;
    timestamp: string;
  }[];
  totalAdsWatched: number;
  achievements: {
    name: string;
    completed: boolean;
    progress: number;
  }[];
}

const AD_DURATIONS = {
  short: { seconds: 15, multiplier: 1 },
  medium: { seconds: 30, multiplier: 2.5 },
  long: { seconds: 60, multiplier: 5 }
};

const AD_ACHIEVEMENTS = [
  { name: 'Ad Novice', requirement: 5, reward: { type: 'dream_tokens', amount: 50 } },
  { name: 'Ad Explorer', requirement: 20, reward: { type: 'premium_time', amount: 48 } },
  { name: 'Ad Master', requirement: 50, reward: { type: 'theme_unlock', amount: 1 } },
];

export const adService = {
  async watchAd(duration: keyof typeof AD_DURATIONS = 'short'): Promise<AdReward> {
    // Simulate ad viewing delay
    await new Promise(resolve => setTimeout(resolve, AD_DURATIONS[duration].seconds * 1000));
    
    // Calculate reward based on duration multiplier
    const baseReward = {
      type: this.getRandomRewardType(),
      amount: this.calculateRewardAmount(duration)
    };

    return baseReward;
  },

  getRandomRewardType(): AdReward['type'] {
    const types: AdReward['type'][] = ['premium_time', 'analysis_credits', 'theme_unlock', 'dream_tokens'];
    return types[Math.floor(Math.random() * types.length)];
  },

  calculateRewardAmount(duration: keyof typeof AD_DURATIONS): number {
    const baseAmounts = {
      premium_time: 24, // hours
      analysis_credits: 3,
      theme_unlock: 1,
      dream_tokens: 10
    };

    const multiplier = AD_DURATIONS[duration].multiplier;
    return Math.floor(baseAmounts[this.getRandomRewardType()] * multiplier);
  },

  getAdHistory(userId: string): AdHistory {
    const history = localStorage.getItem(`ad_history_${userId}`);
    if (!history) {
      return {
        userId,
        rewards: [],
        totalAdsWatched: 0,
        achievements: AD_ACHIEVEMENTS.map(a => ({
          name: a.name,
          completed: false,
          progress: 0
        }))
      };
    }
    return JSON.parse(history);
  },

  recordAdView(userId: string, reward: AdReward): void {
    const history = this.getAdHistory(userId);
    history.rewards.push({
      type: reward.type,
      amount: reward.amount,
      timestamp: new Date().toISOString()
    });

    // Increment total ads watched
    history.totalAdsWatched = (history.totalAdsWatched || 0) + 1;

    // Update achievements
    history.achievements = history.achievements.map(achievement => {
      const achievementDef = AD_ACHIEVEMENTS.find(a => a.name === achievement.name);
      if (achievementDef) {
        const progress = history.totalAdsWatched;
        const completed = progress >= achievementDef.requirement;
        
        if (completed && !achievement.completed) {
          this.grantAchievementReward(userId, achievementDef.reward);
        }

        return {
          ...achievement,
          progress,
          completed
        };
      }
      return achievement;
    });

    // Save the updated history
    localStorage.setItem(`ad_history_${userId}`, JSON.stringify(history));
  },

  grantAchievementReward(userId: string, reward: { type: string; amount: number }): void {
    // In a real app, this would update user's rewards in the backend
    console.log(`Granting achievement reward: ${reward.amount} ${reward.type} to user ${userId}`);
  },

  canWatchAd(userId: string): boolean {
    const lastViewed = localStorage.getItem(`ad_history_${userId}`);
    if (!lastViewed) return true;

    const { rewards } = JSON.parse(lastViewed);
    if (rewards.length === 0) return true;

    const lastViewedDate = new Date(rewards[rewards.length - 1].timestamp);
    const secondsSinceLastAd = (Date.now() - lastViewedDate.getTime()) / 1000;
    
    return secondsSinceLastAd >= 10; // 10 seconds cooldown instead of 1 hour
  },

  getProgress(userId: string): { watched: number; achievements: any[] } {
    const history = this.getAdHistory(userId);
    return {
      watched: history.totalAdsWatched,
      achievements: history.achievements
    };
  }
}; 