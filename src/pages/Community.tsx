import React, { useState } from 'react';
import { MessageCircle, Heart, Share2, Filter, Sparkles, Send, Tag, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dreamAnalyzer } from '../services/dreamAnalyzer';

interface DreamPost {
  id: string;
  userId: string;
  username: string;
  content: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  createdAt: Date;
  analysis?: {
    themes: string[];
    sentiment: string;
  };
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
}

export default function Community() {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'recent' | 'popular' | 'mine'>('recent');
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  // Mock data - in a real app, this would come from your backend
  const [posts, setPosts] = useState<DreamPost[]>([
    {
      id: '1',
      userId: '123',
      username: 'DreamExplorer',
      content: 'Last night, I dreamed of flying over a crystal-clear ocean...',
      tags: ['flying', 'ocean', 'lucid'],
      likes: 42,
      comments: [
        {
          id: 'c1',
          userId: '456',
          username: 'DreamInterpreter',
          content: 'Flying dreams often represent freedom and transcendence!',
          createdAt: new Date(),
        }
      ],
      createdAt: new Date(),
      analysis: {
        themes: ['freedom', 'nature'],
        sentiment: 'positive'
      }
    }
  ]);

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;

    const analysis = dreamAnalyzer.analyzeDream(newPost);
    const newDreamPost: DreamPost = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      content: newPost,
      tags: selectedTags,
      likes: 0,
      comments: [],
      createdAt: new Date(),
      analysis: {
        themes: analysis.themes,
        sentiment: analysis.sentiment.label
      }
    };

    setPosts([newDreamPost, ...posts]);
    setNewPost('');
    setSelectedTags([]);
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const addComment = (postId: string, comment: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? {
        ...post,
        comments: [...post.comments, {
          id: Date.now().toString(),
          userId: user.id,
          username: user.username,
          content: comment,
          createdAt: new Date()
        }]
      } : post
    ));
  };

  const filteredPosts = posts
    .filter(post => {
      if (searchQuery) {
        return post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return true;
    })
    .filter(post => {
      if (filter === 'mine') return post.userId === user.id;
      return true;
    })
    .sort((a, b) => {
      if (filter === 'popular') return b.likes - a.likes;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const commonTags = ['lucid', 'nightmare', 'flying', 'falling', 'chase', 'water', 'family'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dream Community</h1>
        <p className="text-gray-600 dark:text-gray-300">Share and explore dreams with fellow dreamers</p>
      </div>

      {/* Post Creation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your dream with the community..."
          className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none mb-4"
        />
        
        <div className="flex flex-wrap gap-2 mb-4">
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

        <div className="flex justify-end">
          <button
            onClick={handlePostSubmit}
            className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Send className="h-4 w-4 mr-2" />
            Share Dream
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dreams..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
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
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {post.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              {post.analysis && (
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    post.analysis.sentiment === 'positive'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : post.analysis.sentiment === 'negative'
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {post.analysis.sentiment}
                  </span>
                </div>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {post.content}
            </p>

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

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <Heart className="h-5 w-5" />
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{post.comments.length}</span>
                </button>
              </div>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>

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
                            {new Date(comment.createdAt).toLocaleDateString()}
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
        ))}
      </div>
    </div>
  );
}