import React, { useState, useEffect } from 'react';
import { Check, X, CreditCard, Loader, Play, Clock, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_TIERS, subscriptionService } from '../services/subscriptionService';
import { adService } from '../services/adService';
import { rewardService } from '../services/rewardService';
import AdUnit from '../components/AdUnit';

export default function Subscription() {
  const { user } = useAuth();
  const currentTier = subscriptionService.getUserSubscription(user.id);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [showVideoAd, setShowVideoAd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adHistory, setAdHistory] = useState(() => adService.getAdHistory(user.id));

  // Add effect to refresh ad history
  useEffect(() => {
    setAdHistory(adService.getAdHistory(user.id));
  }, [user.id]);

  const handleWatchAd = async () => {
    if (!adService.canWatchAd(user.id)) {
      setError('Please wait before watching another ad');
      return;
    }

    setIsWatchingAd(true);
    setShowVideoAd(true);
  };

  const handleVideoComplete = async () => {
    try {
      const reward = await adService.watchAd('long');
      
      // Add the rewards
      await rewardService.addReward(user.id, {
        type: 'premium_time',
        amount: 24,
        source: 'ad'
      });

      await rewardService.addReward(user.id, {
        type: 'dream_tokens',
        amount: 100,
        source: 'ad'
      });

      await rewardService.addReward(user.id, {
        type: 'analysis_credits',
        amount: 5,
        source: 'ad'
      });
      
      // Record the ad view
      adService.recordAdView(user.id, reward);
      
      // Refresh ad history
      setAdHistory(adService.getAdHistory(user.id));
      
      // Check if user has unlocked a new tier
      const newAdHistory = adService.getAdHistory(user.id);
      if (newAdHistory.totalAdsWatched >= SUBSCRIPTION_TIERS.pro.adRequirement) {
        await subscriptionService.upgradeTier(user.id, 'pro');
      } else if (newAdHistory.totalAdsWatched >= SUBSCRIPTION_TIERS.premium.adRequirement) {
        await subscriptionService.upgradeTier(user.id, 'premium');
      }
      
      setSuccess('Earned premium rewards! Check your profile for details.');
    } catch (error) {
      setError('Failed to process reward. Please try again.');
    } finally {
      setIsWatchingAd(false);
      setShowVideoAd(false);
    }
  };

  const features = {
    advancedAnalysis: 'Advanced Dream Analysis',
    aiArtGeneration: 'AI Dream Art Generation',
    unlimitedDreams: 'Unlimited Dream Storage',
    exportData: 'Export Dream Data',
    customThemes: 'Custom Themes'
  };

  const shouldShowWatchButton = (tierKey: string) => {
    const currentTierName = currentTier.name;
    if (tierKey === 'free') return false;
    if (currentTierName === 'Professional') return false;
    if (currentTierName === 'Premium' && tierKey === 'premium') return false;
    return true;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Unlock Premium Features
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Watch ads to unlock premium features and earn rewards
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-8 p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
          <div
            key={key}
            className={`relative rounded-2xl shadow-xl p-8 ${
              currentTier.name === tier.name
                ? 'border-2 border-indigo-500 dark:border-indigo-400'
                : 'border border-gray-200 dark:border-gray-700'
            } bg-white dark:bg-gray-800`}
          >
            {currentTier.name === tier.name && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm">
                  Current Tier
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {tier.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {tier.description}
              </p>
              {tier.adRequirement > 0 && (
                <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
                  {adHistory.totalAdsWatched}/{tier.adRequirement} ads watched
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {Object.entries(features).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-3">
                  {tier.features[key] ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">{label}</span>
                </div>
              ))}
            </div>

            {tier.name !== 'Basic' && shouldShowWatchButton(key) && (
              <button
                onClick={handleWatchAd}
                disabled={isWatchingAd}
                className={`w-full py-3 px-6 rounded-lg text-center flex items-center justify-center space-x-2 ${
                  isWatchingAd
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isWatchingAd ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Watching...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Watch Ad to Progress</span>
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Video Ad Modal */}
      {showVideoAd && (
        <AdUnit
          slot="video-reward"
          isVideo={true}
          onComplete={handleVideoComplete}
          className="fixed inset-0 z-50"
        />
      )}
    </div>
  );
} 