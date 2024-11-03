import React, { useState } from 'react';
import { Tag, Filter, Search, TrendingUp } from 'lucide-react';

interface DreamCategory {
  id: string;
  name: string;
  description: string;
  tags: string[];
  postCount: number;
  trendingTags: string[];
}

export default function Categories() {
  const [categories, setCategories] = useState<DreamCategory[]>([
    {
      id: '1',
      name: 'Lucid Dreams',
      description: 'Dreams where you become aware that you are dreaming',
      tags: ['lucid', 'control', 'awareness'],
      postCount: 156,
      trendingTags: ['flying', 'reality-check']
    },
    {
      id: '2',
      name: 'Recurring Dreams',
      description: 'Dreams that repeat with similar patterns or themes',
      tags: ['recurring', 'patterns', 'symbols'],
      postCount: 89,
      trendingTags: ['chase', 'falling']
    },
    // Add more categories...
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => category.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="flex gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {['lucid', 'recurring', 'nightmares', 'spiritual'].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTags(prev => 
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                )}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map(category => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {category.description}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {category.postCount} posts
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-indigo-600" />
                  Trending Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.trendingTags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 