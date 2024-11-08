import React, { useEffect, useState } from 'react';
import { Play, X, Loader } from 'lucide-react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layout?: 'in-article' | 'in-feed';
  className?: string;
  onComplete?: () => Promise<void>;
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const handleVideoComplete = async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPlaying(false);
    setIsCompleted(true);
    setIsProcessing(true);
    
    try {
      if (onComplete) {
        await onComplete();
      }
      setTimeout(() => {
        setShowAd(false);
      }, 100);
    } catch (error) {
      console.error('Error completing ad:', error);
      setIsCompleted(false);
      setVideoProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const startVideo = () => {
    if (isPlaying || isCompleted) return;
    
    setIsPlaying(true);
    const interval = setInterval(() => {
      setVideoProgress(prev => {
        const newProgress = prev + 4;
        if (newProgress >= 100) {
          clearInterval(interval);
          handleVideoComplete();
          return 100;
        }
        if (newProgress >= 50 && !canSkip) {
          setCanSkip(true);
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

  const handleSkip = () => {
    if (canSkip) {
      handleVideoComplete();
    }
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
              {isCompleted ? 'Video Complete!' : 'Watch Video for Premium Access'}
            </h3>
            {!isPlaying && !isCompleted && (
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
              ) : isCompleted ? (
                <div className="text-green-500 text-4xl">✓</div>
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
                {isPlaying ? (
                  canSkip ? 'You can now skip the video' : 'Please watch for 5 seconds...'
                ) : 
                 isProcessing ? 'Processing...' : 
                 isCompleted ? 'Complete!' : 
                 'Ready to watch'}
              </p>
            </div>
            {!isPlaying && !isCompleted && (
              <button
                onClick={startVideo}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start Watching
              </button>
            )}
            {isPlaying && canSkip && !isCompleted && (
              <button
                onClick={handleSkip}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Skip & Claim Reward
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
} 