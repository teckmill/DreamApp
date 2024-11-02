import React from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Users, Sparkles, Brain, Moon, Star, CloudMoon, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: BookMarked,
      title: 'Dream Journal',
      description: 'Record and analyze your dreams with AI-powered insights',
      link: '/journal'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Share experiences and connect with fellow dreamers',
      link: '/community'
    },
    {
      icon: Brain,
      title: 'Smart Analysis',
      description: 'Get personalized interpretations and pattern recognition',
      link: '/journal'
    }
  ];

  const benefits = [
    {
      icon: Sparkles,
      title: 'Pattern Recognition',
      description: 'Discover recurring themes and symbols in your dreams'
    },
    {
      icon: Moon,
      title: 'Sleep Insights',
      description: 'Track your sleep patterns and dream frequency'
    },
    {
      icon: Star,
      title: 'Personal Growth',
      description: 'Use dreams for self-reflection and development'
    },
    {
      icon: Compass,
      title: 'Dream Navigation',
      description: 'Learn techniques for lucid dreaming and dream control'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 animate-pulse" />
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4 animate-fade-in">
          Explore Your Dreams
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Unlock the mysteries of your subconscious mind with our AI-powered dream interpretation
          and connect with a community of dreamers.
        </p>
        
        {!isAuthenticated && (
          <div className="flex justify-center gap-4 mb-8">
            <Link
              to="/register"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Login
            </Link>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={isAuthenticated ? feature.link : '/register'}
            className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 transform hover:-translate-y-1"
          >
            <feature.icon className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Unlock the Power of Your Dreams
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <benefit.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl p-12 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Start Your Dream Journey Today
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Join our community of dreamers and begin exploring the fascinating world of your subconscious mind.
        </p>
        {!isAuthenticated && (
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <CloudMoon className="h-5 w-5 mr-2" />
            Begin Your Journey
          </Link>
        )}
      </div>
    </div>
  );
}