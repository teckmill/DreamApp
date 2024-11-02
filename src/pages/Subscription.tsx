import React from 'react';
import { Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_TIERS, subscriptionService } from '../services/subscriptionService';

export default function Subscription() {
  const { user } = useAuth();
  const currentTier = subscriptionService.getUserSubscription(user.id);

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
              className={`w-full py-3 px-6 rounded-lg text-center ${
                currentTier.name === tier.name
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              disabled={currentTier.name === tier.name}
            >
              {currentTier.name === tier.name ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 