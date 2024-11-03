import React, { useState } from 'react';
import { BarChart2, PieChart, Users, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModerationProps } from '../../types/moderation';

interface Poll {
  id: string;
  title: string;
  description: string;
  options: {
    id: string;
    text: string;
    votes: Set<string>;
  }[];
  createdBy: string;
  createdAt: Date;
  endsAt: Date;
  totalVotes: number;
  category: 'dream-patterns' | 'sleep-habits' | 'techniques' | 'experiences';
}

interface PollsProps extends ModerationProps {}

export default function Polls({ onModAction, isModerator }: PollsProps) {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: '1',
      title: 'Most Common Dream Theme',
      description: 'What dream theme do you experience most frequently?',
      options: [
        { id: '1', text: 'Flying', votes: new Set() },
        { id: '2', text: 'Being Chased', votes: new Set() },
        { id: '3', text: 'Falling', votes: new Set() },
        { id: '4', text: 'Being Late', votes: new Set() }
      ],
      createdBy: 'admin',
      createdAt: new Date(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      totalVotes: 0,
      category: 'dream-patterns'
    }
  ]);

  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''],
    category: 'dream-patterns' as Poll['category']
  });

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(polls.map(poll => {
      if (poll.id === pollId) {
        // Remove previous vote if exists
        const previousVote = poll.options.find(opt => 
          opt.votes.has(user.id)
        );
        if (previousVote) {
          previousVote.votes.delete(user.id);
        }

        // Add new vote
        const newOptions = poll.options.map(opt => {
          if (opt.id === optionId) {
            opt.votes.add(user.id);
          }
          return opt;
        });

        return {
          ...poll,
          options: newOptions,
          totalVotes: previousVote ? poll.totalVotes : poll.totalVotes + 1
        };
      }
      return poll;
    }));
  };

  const handleCreatePoll = () => {
    if (!newPoll.title || newPoll.options.some(opt => !opt.trim())) return;

    const poll: Poll = {
      id: Date.now().toString(),
      title: newPoll.title,
      description: newPoll.description,
      options: newPoll.options.map((text, index) => ({
        id: index.toString(),
        text,
        votes: new Set()
      })),
      createdBy: user.id,
      createdAt: new Date(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalVotes: 0,
      category: newPoll.category
    };

    setPolls([poll, ...polls]);
    setNewPoll({
      title: '',
      description: '',
      options: ['', ''],
      category: 'dream-patterns'
    });
  };

  return (
    <div className="space-y-8">
      {/* Create Poll Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Create Poll</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={newPoll.title}
              onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="What's your question?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={newPoll.description}
              onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Add more context..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Options</label>
            {newPoll.options.map((option, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newPoll.options];
                    newOptions[index] = e.target.value;
                    setNewPoll({ ...newPoll, options: newOptions });
                  }}
                  className="flex-1 p-2 border rounded-lg"
                  placeholder={`Option ${index + 1}`}
                />
                {index > 1 && (
                  <button
                    onClick={() => {
                      setNewPoll({
                        ...newPoll,
                        options: newPoll.options.filter((_, i) => i !== index)
                      });
                    }}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setNewPoll({
                ...newPoll,
                options: [...newPoll.options, '']
              })}
              className="text-indigo-600 text-sm"
            >
              + Add Option
            </button>
          </div>
          <button
            onClick={handleCreatePoll}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg"
          >
            Create Poll
          </button>
        </div>
      </div>

      {/* Active Polls */}
      <div className="grid md:grid-cols-2 gap-6">
        {polls.map(poll => (
          <div key={poll.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{poll.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {poll.description}
              </p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Users className="h-4 w-4 mr-1" />
                <span>{poll.totalVotes} votes</span>
                <Clock className="h-4 w-4 ml-4 mr-1" />
                <span>
                  {new Date(poll.endsAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {poll.options.map(option => {
                const voteCount = option.votes.size;
                const percentage = poll.totalVotes > 0
                  ? Math.round((voteCount / poll.totalVotes) * 100)
                  : 0;

                return (
                  <div key={option.id} className="relative">
                    <button
                      onClick={() => handleVote(poll.id, option.id)}
                      className={`w-full p-3 rounded-lg text-left relative z-10 ${
                        option.votes.has(user.id)
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="absolute left-0 top-0 h-full bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-all"
                           style={{ width: `${percentage}%` }} />
                      <span className="relative z-10">{option.text}</span>
                      <span className="relative z-10 float-right">{percentage}%</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 