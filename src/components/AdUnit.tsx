import React, { useEffect, useState } from 'react';
import { Play, X, Loader } from 'lucide-react';

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
  const [showAd, setShowAd] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup interval on unmount
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const handleVideoComplete = async () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setIsPlaying(false);
    setShowAd(false);
    
    // Make sure we call onComplete to trigger the subscription update
    if (onComplete) {
      try {
        await onComplete();
      } catch (error) {
        console.error('Error completing ad:', error);
      }
    }
  };

  const startVideo = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setVideoProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          handleVideoComplete();
          return 100;
        }
        return newProgress;
      });
    }, 100);
    setIntervalId(interval);
  };

  const handleClose = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setShowAd(false);
  };

  if (!showAd) {
    return null;
  }

  if (isVideo) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Watch Video for Premium Access
            </h3>
            {!isPlaying && (
              <button 
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <div className="relative">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              {isPlaying ? (
                <Loader className="h-12 w-12 text-gray-400 animate-spin" />
              ) : (
                <Play className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                {isPlaying ? 'Watching video...' : videoProgress === 100 ? 'Complete!' : 'Ready to watch'}
              </p>
            </div>
            {!isPlaying && videoProgress < 100 && (
              <button
                onClick={startVideo}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start Watching
              </button>
            )}
          </div>
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