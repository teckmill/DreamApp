import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Share2, Filter, Sparkles, Send, Tag, Search, TrendingUp, Award, BookOpen, ThumbsUp, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dreamAnalyzer } from '../services/dreamAnalyzer';
import { subscriptionService } from '../services/subscriptionService';
import AdUnit from '../components/AdUnit';

interface DreamPost {
  id: string;
  userId: string;
  username: string;
  content: string;
  tags: string[];
  likes: Set<string>;
  comments: Comment[];
  createdAt: Date;
  category: string;
  analysis?: {
    themes: string[];
    sentiment: string;
  };
  saves: Set<string>; // New: Track saves/bookmarks
  reports: Set<string>; // New: Track reports
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
  likes: Set<string>; // New: Comment likes
}

interface UserReputation {
  userId: string;
  score: number;
  badges: string[];
  level: number;
}

const POSTS_STORAGE_KEY = 'dreamscape_community_posts';
const REPUTATION_STORAGE_KEY = 'dreamscape_user_reputation';

const DREAM_CATEGORIES = [
  'Lucid Dreams',
  'Nightmares',
  'Recurring Dreams',
  'Prophetic Dreams',
  'Adventure Dreams',
  'Healing Dreams',
  'Spiritual Dreams'
];

export default function Community() {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'recent' | 'popular' | 'mine' | 'saved'>('recent');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [trendingTags, setTrendingTags] = useState<{tag: string, count: number}[]>([]);
  const [userReputation, setUserReputation] = useState<UserReputation>(() => {
    const saved = localStorage.getItem(`${REPUTATION_STORAGE_KEY}_${user.id}`);
    return saved ? JSON.parse(saved) : {
      userId: user.id,
      score: 0,
      badges: [],
      level: 1
    };
  });

  const [posts, setPosts] = useState<DreamPost[]>(() => {
    const savedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
    if (savedPosts) {
      const parsedPosts = JSON.parse(savedPosts);
      return parsedPosts.map((post: any) => ({
        ...post,
        likes: new Set(Array.isArray(post.likes) ? post.likes : []),
        saves: new Set(Array.isArray(post.saves) ? post.saves : []),
        reports: new Set(Array.isArray(post.reports) ? post.reports : []),
        createdAt: new Date(post.createdAt),
        comments: post.comments.map((comment: any) => ({
          ...comment,
          likes: new Set(Array.isArray(comment.likes) ? comment.likes : []),
          createdAt: new Date(comment.createdAt)
        }))
      }));
    }
    return [];
  });

  // Save posts to localStorage whenever they change
  useEffect(() => {
    try {
      // Convert Sets to arrays for JSON serialization
      const postsToSave = posts.map(post => ({
        ...post,
        likes: Array.from(post.likes),
        saves: Array.from(post.saves),
        reports: Array.from(post.reports),
        createdAt: post.createdAt.toISOString(),
        comments: post.comments.map(comment => ({
          ...comment,
          likes: Array.from(comment.likes),
          createdAt: comment.createdAt.toISOString()
        }))
      }));
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(postsToSave));
    } catch (error) {
      console.error('Error saving posts:', error);
    }
  }, [posts]);

  // Calculate trending tags
  useEffect(() => {
    const tagCounts = posts.reduce((acc, post) => {
      post.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTrendingTags(sortedTags);
  }, [posts]);

  // Update reputation when user interactions happen
  const updateReputation = (action: 'post' | 'like' | 'comment' | 'received_like') => {
    const points = {
      post: 5,
      like: 1,
      comment: 2,
      received_like: 3
    };

    const newScore = userReputation.score + points[action];
    const newLevel = Math.floor(newScore / 100) + 1;
    
    // Check for new badges
    const badges = [...userReputation.badges];
    if (newScore >= 100 && !badges.includes('Active Contributor')) {
      badges.push('Active Contributor');
    }
    if (newScore >= 500 && !badges.includes('Dream Expert')) {
      badges.push('Dream Expert');
    }

    const updatedReputation = {
      ...userReputation,
      score: newScore,
      level: newLevel,
      badges
    };

    setUserReputation(updatedReputation);
    localStorage.setItem(
      `${REPUTATION_STORAGE_KEY}_${user.id}`, 
      JSON.stringify(updatedReputation)
    );
  };

  // Enhanced post submission
  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;

    if (!subscriptionService.checkLimit(user.id, 'communityPosts')) {
      alert('You have reached your monthly post limit. Watch ads or upgrade to post more!');
      return;
    }

    try {
      const analysis = dreamAnalyzer.analyzeDream(newPost);
      const newDreamPost: DreamPost = {
        id: Date.now().toString(),
        userId: user.id,
        username: user.username,
        content: newPost,
        tags: selectedTags,
        likes: new Set(),
        comments: [],
        createdAt: new Date(),
        category: selectedCategory,
        analysis: {
          themes: analysis.themes,
          sentiment: analysis.sentiment.label
        },
        saves: new Set(),
        reports: new Set()
      };

      setPosts(prevPosts => [newDreamPost, ...prevPosts]);
      setNewPost('');
      setSelectedTags([]);
      subscriptionService.incrementUsage(user.id, 'communityPosts');
      updateReputation('post');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Enhanced interaction handlers
  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLikes = new Set(post.likes);
        if (newLikes.has(user.id)) {
          newLikes.delete(user.id);
        } else {
          newLikes.add(user.id);
          updateReputation('like');
          if (post.userId !== user.id) {
            // Update reputation for post owner
            const postOwnerRep = JSON.parse(
              localStorage.getItem(`${REPUTATION_STORAGE_KEY}_${post.userId}`) || '{}'
            );
            if (postOwnerRep.userId) {
              postOwnerRep.score += 3;
              localStorage.setItem(
                `${REPUTATION_STORAGE_KEY}_${post.userId}`,
                JSON.stringify(postOwnerRep)
              );
            }
          }
        }
        return { ...post, likes: newLikes };
      }
      return post;
    }));
  };

  const toggleSave = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newSaves = new Set(post.saves);
        newSaves.has(user.id) ? newSaves.delete(user.id) : newSaves.add(user.id);
        return { ...post, saves: newSaves };
      }
      return post;
    }));
  };

  const reportPost = (postId: string) => {
    if (window.confirm('Are you sure you want to report this post?')) {
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const newReports = new Set(post.reports);
          newReports.add(user.id);
          return { ...post, reports: newReports };
        }
        return post;
      }));
    }
  };

  // Enhanced filtering
  const filteredPosts = posts
    .filter(post => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          post.content.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query)) ||
          post.username.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(post => {
      // Category filter
      if (selectedCategory !== 'all') {
        return post.category === selectedCategory;
      }
      return true;
    })
    .filter(post => {
      // View filter
      switch (filter) {
        case 'mine':
          return post.userId === user.id;
        case 'saved':
          return post.saves.has(user.id);
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Sort based on filter
      if (filter === 'popular') {
        const aScore = a.likes.size * 2 + a.comments.length;
        const bScore = b.likes.size * 2 + b.comments.length;
        return bScore - aScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Add missing commonTags array
  const commonTags = [
    'lucid',
    'nightmare',
    'flying',
    'falling',
    'chase',
    'water',
    'family'
  ];

  // Add missing handleShare function
  const handleShare = async (post: DreamPost) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Dream Share',
          text: post.content,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(post.content);
        alert('Dream copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Add missing addComment function
  const addComment = (postId: string, content: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: Date.now().toString(),
          userId: user.id,
          username: user.username,
          content,
          createdAt: new Date(),
          likes: new Set<string>()
        };
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
    updateReputation('comment');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dream Community
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Share and explore dreams with fellow dreamers
        </p>
      </div>

      {/* User Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold">Level {userReputation.level}</div>
            <div className="text-gray-600 dark:text-gray-300">
              {userReputation.score} points
            </div>
          </div>
          <div className="flex space-x-2">
            {userReputation.badges.map(badge => (
              <span key={badge} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Tags */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-8">
        <h2 className="font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Trending Tags
        </h2>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
            >
              #{tag} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Post Creation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your dream with the community..."
          className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none mb-4"
        />
        
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <option value="all">Select Category</option>
            {DREAM_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {commonTags.map(tag => (
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
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handlePostSubmit}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Share Dream
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search dreams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'recent'
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'popular'
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setFilter('saved')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'saved'
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            Saved
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'mine'
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            My Dreams
          </button>
        </div>
      </div>

      {/* Dream Posts */}
      <div className="space-y-6">
        {filteredPosts.map((post, index) => (
          <React.Fragment key={post.id}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {post.username}
                    </h3>
                    {post.userId === user.id && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                    {post.category}
                  </span>
                  {post.analysis && (
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      post.analysis.sentiment === 'positive'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : post.analysis.sentiment === 'negative'
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {post.analysis.sentiment}
                    </span>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {post.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Dream Themes */}
              {post.analysis?.themes && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dream Themes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.analysis.themes.map((theme) => (
                      <span
                        key={theme}
                        className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm rounded-full"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center space-x-2 ${
                      post.likes.has(user.id)
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${post.likes.has(user.id) ? 'fill-current' : ''}`} />
                    <span>{post.likes.size}</span>
                  </button>
                  <button
                    onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments.length}</span>
                  </button>
                  <button
                    onClick={() => toggleSave(post.id)}
                    className={`flex items-center space-x-2 ${
                      post.saves.has(user.id)
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : 'text-gray-500 hover:text-yellow-500'
                    }`}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>{post.saves.size}</span>
                  </button>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => handleShare(post)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                  {post.userId !== user.id && (
                    <button
                      onClick={() => reportPost(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-500"
                    >
                      <Flag className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {comment.username}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const input = form.elements.namedItem('comment') as HTMLInputElement;
                        if (input.value.trim()) {
                          addComment(post.id, input.value);
                          input.value = '';
                        }
                      }}
                      className="flex space-x-2"
                    >
                      <input
                        name="comment"
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Post
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
            
            {/* Ad placement */}
            {(index + 1) % 3 === 0 && (
              <div className="my-8">
                <AdUnit 
                  slot="1234567890"
                  format="auto"
                  layout="in-article"
                  className="w-full min-h-[250px]"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}