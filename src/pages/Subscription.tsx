import React, { useState } from 'react';
import { Check, X, CreditCard, Loader, Play, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_TIERS, subscriptionService } from '../services/subscriptionService';
import { paymentService } from '../services/paymentService';
import { adService } from '../services/adService';

export default function Subscription() {
  const { user } = useAuth();
  const currentTier = subscriptionService.getUserSubscription(user.id);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCooldown, setAdCooldown] = useState(!adService.canWatchAd(user.id));

  const handleUpgrade = async (tierKey: string, tier: any) => {
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Process payment
      const paymentSuccessful = await paymentService.processPayment(tierKey);
      
      if (paymentSuccessful) {
        // Update subscription
        await paymentService.updateSubscription(user.id, tierKey);
        setSuccess(`Successfully upgraded to ${tier.name}!`);
        
        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleWatchAd = async () => {
    if (!adService.canWatchAd(user.id)) {
      return;
    }

    setIsWatchingAd(true);
    try {
      const reward = await adService.watchAd();
      adService.recordAdView(user.id);
      
      // Apply reward
      if (reward.type === 'premium_time') {
        await paymentService.updateSubscription(user.id, 'premium');
        setSuccess(`Earned ${reward.amount} hours of premium access!`);
      }
      
      setAdCooldown(true);
      setTimeout(() => setAdCooldown(false), 3600000); // 1 hour cooldown
    } catch (error) {
      setError('Failed to complete ad view. Please try again.');
    } finally {
      setIsWatchingAd(false);
    }
  };

  const features = {
    advancedAnalysis: 'Advanced Dream Analysis',
    aiArtGeneration: 'AI Dream Art Generation',
    unlimitedDreams: 'Unlimited Dream Storage',
    exportData: 'Export Dream Data',
    customThemes: 'Custom Themes'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Dream Journey
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Select the plan that best fits your dream exploration needs
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
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {tier.name}
              </h2>
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                ${tier.price}
                <span className="text-base font-normal text-gray-600 dark:text-gray-400">/month</span>
              </p>
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
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {tier.limits.dreamsPerMonth === -1
                      ? 'Unlimited dreams per month'
                      : `${tier.limits.dreamsPerMonth} dreams per month`}
                  </span>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {tier.limits.analysisPerMonth === -1
                      ? 'Unlimited analysis'
                      : `${tier.limits.analysisPerMonth} analysis per month`}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleUpgrade(key, tier)}
              disabled={currentTier.name === tier.name || processing}
              className={`w-full py-3 px-6 rounded-lg text-center flex items-center justify-center space-x-2 ${
                currentTier.name === tier.name
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {processing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : currentTier.name === tier.name ? (
                'Current Plan'
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>Upgrade</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Watch Ads for Premium Access
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Earn premium features by watching short ads
        </p>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Watch an Ad
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Get 24 hours of premium access
            </p>
          </div>
          <button
            onClick={handleWatchAd}
            disabled={isWatchingAd || adCooldown}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isWatchingAd || adCooldown
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isWatchingAd ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Watching Ad...</span>
              </>
            ) : adCooldown ? (
              <>
                <Clock className="h-5 w-5" />
                <span>Cooldown</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Watch Ad</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          * You can watch one ad per hour
        </div>
      </div>
    </div>
  );
} 