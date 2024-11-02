import { rewardService } from './rewardService';

export interface PremiumFeatures {
  advancedAnalysis: boolean;
  unlimitedDreams: boolean;
  exportData: boolean;
  unlimitedAnalysis: boolean;
}

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Basic',
    adRequirement: 0,
    features: {
      advancedAnalysis: false,
      unlimitedDreams: false,
      exportData: false,
      unlimitedAnalysis: false
    },
    limits: {
      dreamsPerMonth: 5,
      analysisPerMonth: 3,
      communityPosts: 2
    },
    description: 'Start your dream journey'
  },
  premium: {
    name: 'Premium',
    adRequirement: 5,
    features: {
      advancedAnalysis: true,
      unlimitedDreams: true,
      exportData: true,
      unlimitedAnalysis: true
    },
    limits: {
      dreamsPerMonth: -1,
      analysisPerMonth: -1,
      communityPosts: -1
    },
    description: 'Unlock with 5 ad views'
  },
  pro: {
    name: 'Professional',
    adRequirement: 15,
    features: {
      advancedAnalysis: true,
      unlimitedDreams: true,
      exportData: true,
      unlimitedAnalysis: true
    },
    limits: {
      dreamsPerMonth: -1,
      analysisPerMonth: -1,
      communityPosts: -1
    },
    description: 'Unlock with 15 ad views'
  }
};

export const subscriptionService = {
  getUserSubscription(userId: string) {
    try {
      const subscription = localStorage.getItem(`subscription_${userId}`);
      const adHistory = localStorage.getItem(`ad_history_${userId}`);
      const adsWatched = adHistory ? JSON.parse(adHistory).totalAdsWatched : 0;

      // Determine tier based on ads watched
      let tier;
      if (adsWatched >= SUBSCRIPTION_TIERS.pro.adRequirement) {
        tier = SUBSCRIPTION_TIERS.pro;
      } else if (adsWatched >= SUBSCRIPTION_TIERS.premium.adRequirement) {
        tier = SUBSCRIPTION_TIERS.premium;
      } else {
        tier = SUBSCRIPTION_TIERS.free;
      }

      // If there's a saved subscription, merge it with the determined tier
      if (subscription) {
        const parsed = JSON.parse(subscription);
        return {
          ...tier,
          ...parsed,
          features: {
            ...tier.features,
            ...(parsed.features || {})
          }
        };
      }

      return tier;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return SUBSCRIPTION_TIERS.free;
    }
  },

  hasFeature(userId: string, feature: keyof PremiumFeatures): boolean {
    try {
      const subscription = this.getUserSubscription(userId);
      return subscription?.features?.[feature] || false;
    } catch (error) {
      console.error('Error checking feature:', error);
      return false;
    }
  },

  checkLimit(userId: string, limitType: 'dreamsPerMonth' | 'analysisPerMonth' | 'communityPosts'): boolean {
    const subscription = this.getUserSubscription(userId);
    const limit = subscription.limits[limitType];
    
    if (limit === -1) return true; // unlimited

    const usage = this.getUsage(userId, limitType);
    return usage < limit;
  },

  getUsage(userId: string, type: string): number {
    const usage = localStorage.getItem(`usage_${userId}_${type}`);
    return usage ? parseInt(usage) : 0;
  },

  incrementUsage(userId: string, type: string): void {
    const currentUsage = this.getUsage(userId, type);
    localStorage.setItem(`usage_${userId}_${type}`, (currentUsage + 1).toString());
  },

  async upgradeTier(userId: string, tier: keyof typeof SUBSCRIPTION_TIERS): Promise<void> {
    const subscription = {
      ...SUBSCRIPTION_TIERS[tier],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    localStorage.setItem(`subscription_${userId}`, JSON.stringify(subscription));
    
    // Grant initial rewards based on tier
    const rewards = {
      premium: {
        analysisCredits: 50,
        dreamTokens: 1000,
        premiumTime: 720 // 30 days in hours
      },
      pro: {
        analysisCredits: 100,
        dreamTokens: 2000,
        premiumTime: 720,
        themes: ['pro_theme_1', 'pro_theme_2']
      }
    };

    if (tier in rewards) {
      const tierRewards = rewards[tier as keyof typeof rewards];
      await rewardService.addReward(userId, {
        type: 'analysis_credits',
        amount: tierRewards.analysisCredits,
        source: 'subscription'
      });
      await rewardService.addReward(userId, {
        type: 'dream_tokens',
        amount: tierRewards.dreamTokens,
        source: 'subscription'
      });
      await rewardService.addReward(userId, {
        type: 'premium_time',
        amount: tierRewards.premiumTime,
        source: 'subscription'
      });
    }
  },

  checkFeatureAccess(userId: string, feature: keyof PremiumFeatures): boolean {
    const subscription = this.getUserSubscription(userId);
    const rewards = rewardService.getUserRewards(userId);

    // Check if user has premium time remaining
    if (rewards.premiumTimeLeft > 0) {
      return true;
    }

    // Check feature-specific access
    switch (feature) {
      case 'advancedAnalysis':
        return rewards.analysisCredits > 0 || subscription.features.advancedAnalysis;
      case 'unlimitedDreams':
        return subscription.features.unlimitedDreams;
      default:
        return subscription.features[feature];
    }
  },

  async removePremium(userId: string): Promise<void> {
    localStorage.removeItem(`subscription_${userId}`);
  }
}; 