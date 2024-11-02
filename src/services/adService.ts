interface AdReward {
  type: 'premium_time' | 'analysis_credits' | 'theme_unlock';
  amount: number;
}

export const adService = {
  // Track ad views
  async watchAd(): Promise<AdReward> {
    // Simulate ad viewing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In a real app, this would verify ad completion with an ad network
    return {
      type: 'premium_time',
      amount: 24 // hours of premium access
    };
  },

  // Get user's ad viewing history
  getAdHistory(userId: string): number {
    const history = localStorage.getItem(`ad_history_${userId}`);
    return history ? JSON.parse(history).count : 0;
  },

  // Record ad view
  recordAdView(userId: string): void {
    const history = this.getAdHistory(userId);
    localStorage.setItem(`ad_history_${userId}`, JSON.stringify({
      count: history + 1,
      lastViewed: new Date().toISOString()
    }));
  },

  // Check if user can watch another ad (limit rate)
  canWatchAd(userId: string): boolean {
    const lastViewed = localStorage.getItem(`ad_history_${userId}`);
    if (!lastViewed) return true;

    const { lastViewed: lastViewedDate } = JSON.parse(lastViewed);
    const hoursSinceLastAd = (Date.now() - new Date(lastViewedDate).getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastAd >= 1; // One hour cooldown
  }
}; 