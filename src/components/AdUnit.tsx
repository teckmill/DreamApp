import React, { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layout?: 'in-article' | 'in-feed';
  className?: string;
  onComplete?: () => void;
  isVideo?: boolean;
}

export default function AdUnit({ 
  slot, 
  format = 'auto', 
  layout, 
  className = '',
  onComplete,
  isVideo = false 
}: AdUnitProps) {
  const [showAd, setShowAd] = useState(!isVideo);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    if (!isVideo) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('Error loading ad:', error);
      }
    }
  }, [isVideo]);

  const handleVideoComplete = () => {
    setShowAd(false);
    onComplete?.();
  };

  const simulateVideoProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setVideoProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        handleVideoComplete();
      }
    }, 300); // 30 seconds total
    return () => clearInterval(interval);
  };

  if (isVideo) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Watch Video for Premium Access
            </h3>
            <button 
              onClick={() => setShowAd(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {showAd && (
            <div className="relative">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {videoProgress < 100 ? 'Watching video...' : 'Complete!'}
                </p>
              </div>
              {videoProgress === 0 && (
                <button
                  onClick={() => {
                    simulateVideoProgress();
                  }}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Start Watching
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1778492527638407"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layout && { 'data-ad-layout': layout })}
      />
    </div>
  );
} 