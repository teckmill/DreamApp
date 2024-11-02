export interface PremiumFeatures {
  advancedAnalysis: boolean;
  aiArtGeneration: boolean;
  unlimitedDreams: boolean;
  exportData: boolean;
  customThemes: boolean;
}

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Basic',
    price: 0,
    features: {
      advancedAnalysis: false,
      aiArtGeneration: false,
      unlimitedDreams: true,
      exportData: false,
      customThemes: false
    },
    limits: {
      dreamsPerMonth: 5,
      analysisPerMonth: 3,
      communityPosts: 2
    }
  },
  premium: {
    name: 'Premium',
    price: 4.99,
    features: {
      advancedAnalysis: true,
      aiArtGeneration: false,
      unlimitedDreams: true,
      exportData: true,
      customThemes: false
    },
    limits: {
      dreamsPerMonth: -1, // unlimited
      analysisPerMonth: -1, // unlimited
      communityPosts: -1 // unlimited
    }
  },
  pro: {
    name: 'Professional',
    price: 9.99,
    features: {
      advancedAnalysis: true,
      aiArtGeneration: true,
      unlimitedDreams: true,
      exportData: true,
      customThemes: true
    },
    limits: {
      dreamsPerMonth: -1,
      analysisPerMonth: -1,
      communityPosts: -1
    }
  }
};

export const subscriptionService = {
  getUserSubscription(userId: string) {
    const subscription = localStorage.getItem(`subscription_${userId}`);
    return subscription ? JSON.parse(subscription) : SUBSCRIPTION_TIERS.free;
  },

  hasFeature(userId: string, feature: keyof PremiumFeatures): boolean {
    const subscription = this.getUserSubscription(userId);
    return subscription.features[feature];
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
  }
}; 