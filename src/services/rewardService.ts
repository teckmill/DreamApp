interface Reward {
  type: 'dream_tokens' | 'premium_time' | 'theme_unlock' | 'analysis_credits';
  amount: number;
  source: 'ad' | 'daily' | 'streak' | 'achievement' | 'admin';
}

interface UserRewards {
  userId: string;
  dreamTokens: number;
  premiumTimeLeft: number; // in hours
  unlockedThemes: string[];
  analysisCredits: number;
  lastDailyReward: string;
  currentStreak: number;
  lastUpdate?: string;
}

const DAILY_REWARDS = {
  base: {
    dreamTokens: 50,
    analysisCredits: 1
  },
  streak: {
    3: { multiplier: 1.5, bonus: 'premium_time', amount: 2 }, // 2 hours premium
    7: { multiplier: 2, bonus: 'theme_unlock', amount: 1 },
    14: { multiplier: 2.5, bonus: 'analysis_credits', amount: 3 },
    30: { multiplier: 3, bonus: 'premium_time', amount: 24 } // 24 hours premium
  }
};

export const rewardService = {
  getUserRewards(userId: string): UserRewards {
    const rewards = localStorage.getItem(`rewards_${userId}`);
    if (!rewards) {
      return {
        userId,
        dreamTokens: 0,
        premiumTimeLeft: 0,
        unlockedThemes: [],
        analysisCredits: 3, // Start with 3 free credits
        lastDailyReward: '',
        currentStreak: 0
      };
    }

    const parsedRewards = JSON.parse(rewards);
    
    // Update premium time based on expiration
    if (parsedRewards.premiumTimeLeft > 0) {
      const lastUpdate = new Date(parsedRewards.lastUpdate || Date.now());
      const now = new Date();
      const hoursPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60));
      parsedRewards.premiumTimeLeft = Math.max(0, parsedRewards.premiumTimeLeft - hoursPassed);
      parsedRewards.lastUpdate = now.toISOString();
      this.saveUserRewards(parsedRewards);
    }

    return parsedRewards;
  },

  saveUserRewards(rewards: UserRewards): void {
    // Always update the lastUpdate timestamp when saving
    const updatedRewards = {
      ...rewards,
      lastUpdate: new Date().toISOString()
    };
    localStorage.setItem(`rewards_${rewards.userId}`, JSON.stringify(updatedRewards));
  },

  async claimDailyReward(userId: string): Promise<Reward[]> {
    const rewards = this.getUserRewards(userId);
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already claimed today
    if (rewards.lastDailyReward === today) {
      throw new Error('Daily reward already claimed');
    }

    // Update streak
    if (this.isConsecutiveDay(rewards.lastDailyReward)) {
      rewards.currentStreak++;
    } else {
      rewards.currentStreak = 1;
    }

    // Calculate rewards with streak multiplier
    const streakLevel = this.getStreakLevel(rewards.currentStreak);
    const multiplier = streakLevel ? DAILY_REWARDS.streak[streakLevel].multiplier : 1;

    const claimedRewards: Reward[] = [
      {
        type: 'dream_tokens',
        amount: Math.floor(DAILY_REWARDS.base.dreamTokens * multiplier),
        source: 'daily'
      },
      {
        type: 'analysis_credits',
        amount: DAILY_REWARDS.base.analysisCredits,
        source: 'daily'
      }
    ];

    // Add streak bonus if applicable
    if (streakLevel && DAILY_REWARDS.streak[streakLevel].bonus) {
      claimedRewards.push({
        type: DAILY_REWARDS.streak[streakLevel].bonus as Reward['type'],
        amount: DAILY_REWARDS.streak[streakLevel].amount,
        source: 'streak'
      });
    }

    // Apply rewards
    rewards.dreamTokens += claimedRewards
      .filter(r => r.type === 'dream_tokens')
      .reduce((sum, r) => sum + r.amount, 0);
    
    rewards.analysisCredits += claimedRewards
      .filter(r => r.type === 'analysis_credits')
      .reduce((sum, r) => sum + r.amount, 0);
    
    rewards.premiumTimeLeft += claimedRewards
      .filter(r => r.type === 'premium_time')
      .reduce((sum, r) => sum + r.amount, 0);

    claimedRewards
      .filter(r => r.type === 'theme_unlock')
      .forEach(() => {
        // Add a new theme (in a real app, you'd have a theme selection system)
        rewards.unlockedThemes.push(`theme_${rewards.unlockedThemes.length + 1}`);
      });

    rewards.lastDailyReward = today;
    this.saveUserRewards(rewards);

    return claimedRewards;
  },

  isConsecutiveDay(lastReward: string): boolean {
    if (!lastReward) return false;
    
    const lastDate = new Date(lastReward);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
  },

  getStreakLevel(streak: number): keyof typeof DAILY_REWARDS.streak | null {
    const levels = Object.keys(DAILY_REWARDS.streak)
      .map(Number)
      .sort((a, b) => b - a);

    for (const level of levels) {
      if (streak >= level) return level;
    }
    return null;
  },

  async addReward(userId: string, reward: Reward): Promise<void> {
    const rewards = this.getUserRewards(userId);

    switch (reward.type) {
      case 'dream_tokens':
        rewards.dreamTokens += reward.amount;
        break;
      case 'premium_time':
        rewards.premiumTimeLeft = (rewards.premiumTimeLeft || 0) + reward.amount;
        break;
      case 'theme_unlock':
        rewards.unlockedThemes.push(`theme_${rewards.unlockedThemes.length + 1}`);
        break;
      case 'analysis_credits':
        rewards.analysisCredits += reward.amount;
        break;
    }

    // Update the lastUpdate timestamp
    rewards.lastUpdate = new Date().toISOString();
    this.saveUserRewards(rewards);
  },

  canUseAnalysis(userId: string): boolean {
    const rewards = this.getUserRewards(userId);
    return rewards.analysisCredits > 0 || rewards.premiumTimeLeft > 0;
  },

  useAnalysisCredit(userId: string): void {
    const rewards = this.getUserRewards(userId);
    if (rewards.premiumTimeLeft > 0) return; // Premium users don't use credits
    if (rewards.analysisCredits <= 0) throw new Error('No analysis credits available');
    
    rewards.analysisCredits--;
    this.saveUserRewards(rewards);
  },

  async removeReward(userId: string, reward: { type: string; amount: number }): Promise<void> {
    const rewards = this.getUserRewards(userId);

    switch (reward.type) {
      case 'dream_tokens':
        rewards.dreamTokens = Math.max(0, rewards.dreamTokens - reward.amount);
        break;
      case 'premium_time':
        rewards.premiumTimeLeft = Math.max(0, rewards.premiumTimeLeft - reward.amount);
        break;
      case 'analysis_credits':
        rewards.analysisCredits = Math.max(0, rewards.analysisCredits - reward.amount);
        break;
    }

    rewards.lastUpdate = new Date().toISOString();
    this.saveUserRewards(rewards);
  },

  async removeAllRewards(userId: string): Promise<void> {
    const rewards = this.getUserRewards(userId);
    rewards.dreamTokens = 0;
    rewards.premiumTimeLeft = 0;
    rewards.analysisCredits = 0;
    rewards.lastUpdate = new Date().toISOString();
    this.saveUserRewards(rewards);
  }
}; 