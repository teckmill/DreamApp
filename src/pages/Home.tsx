import React from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Users, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4">
          Explore Your Dreams
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Unlock the mysteries of your subconscious mind with our AI-powered dream interpretation
          and connect with a community of dreamers.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[
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
            icon: Sparkles,
            title: 'Daily Insights',
            description: 'Discover patterns and meanings in your dream journey',
            link: '/profile'
          }
        ].map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <feature.icon className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 md:p-12">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Your Dream Journey Today
          </h2>
          <p className="text-indigo-100 mb-6 max-w-2xl">
            Join thousands of dreamers who are discovering the hidden meanings behind their dreams
            and connecting with others on similar journeys.
          </p>
          <Link
            to="/journal"
            className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors duration-300"
          >
            Start Journaling
            <BookMarked className="ml-2 h-5 w-5" />
          </Link>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2342&q=80')] opacity-10 mix-blend-overlay" />
      </div>
    </div>
  );
}