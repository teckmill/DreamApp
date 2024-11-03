import React from 'react';
import { Shield, AlertTriangle, Heart, MessageCircle, Flag } from 'lucide-react';

export default function Guidelines() {
  const guidelines = [
    {
      icon: Shield,
      title: 'Respect Privacy',
      description: 'Respect others\' privacy and personal boundaries. Do not share personal information without consent.'
    },
    {
      icon: Heart,
      title: 'Be Supportive',
      description: 'Provide constructive and supportive feedback. Remember that dreams can be deeply personal.'
    },
    {
      icon: MessageCircle,
      title: 'Meaningful Discussion',
      description: 'Engage in meaningful discussions and avoid spam or irrelevant content.'
    },
    {
      icon: AlertTriangle,
      title: 'Content Guidelines',
      description: 'Keep content appropriate and avoid explicit, offensive, or harmful material.'
    },
    {
      icon: Flag,
      title: 'Report Issues',
      description: 'Report any violations of these guidelines to help maintain a safe community.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">Community Guidelines</h1>
        
        <div className="space-y-8">
          {guidelines.map((guideline, index) => (
            <div key={index} className="flex space-x-4">
              <div className="flex-shrink-0">
                <guideline.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">{guideline.title}</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {guideline.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Enforcement</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Violations of these guidelines may result in warnings, temporary restrictions,
            or permanent removal from the community. Our moderation team reviews all
            reports and takes appropriate action to maintain a safe and supportive
            environment.
          </p>
        </div>
      </div>
    </div>
  );
} 