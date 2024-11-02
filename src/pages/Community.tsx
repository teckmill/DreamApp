import React from 'react';
import { MessageCircle, Heart, Share2, BookOpen } from 'lucide-react';

export default function Community() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dream Community</h1>
        <p className="text-gray-600 dark:text-gray-300">Share and explore dreams with fellow dreamers</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {[...Array(4)].map((_, index) => (
          <article
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={`https://i.pravatar.cc/40?img=${index + 1}`}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {['Sarah Dreams', 'Dream Walker', 'Luna Night', 'Star Gazer'][index]}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {index} hour{index !== 1 ? 's' : ''} ago
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {[
                    'Flying Through Crystal Caves',
                    'The Infinite Library',
                    'Dancing with Shadows',
                    'Time Traveling Train'
                  ][index]}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {[
                    "In my dream, I was soaring through crystalline caves that seemed to pulse with their own light...",
                    "I found myself in an endless library where books floated through the air...",
                    "My shadow came alive and invited me to dance under a moon that changed colors...",
                    "The train I boarded traveled through different time periods, each station a new era..."
                  ][index]}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {['Lucid', 'Adventure', 'Spiritual', 'Mystery']
                  .slice(0, index + 2)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <Heart className="h-5 w-5" />
                    <span>{42 + index * 11}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <MessageCircle className="h-5 w-5" />
                    <span>{12 + index * 3}</span>
                  </button>
                </div>
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <BookOpen className="h-5 w-5" />
                    <span>Interpret</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}