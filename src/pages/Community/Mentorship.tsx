import React, { useState } from 'react';
import { Book, Star, Users, MessageCircle, Award, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReputationBadge from '../../components/community/ReputationBadge';

interface Mentor {
  id: string;
  userId: string;
  username: string;
  specialties: string[];
  experience: string;
  availability: 'open' | 'limited' | 'closed';
  rating: number;
  reviewCount: number;
  menteeCount: number;
  achievements: string[];
  reputation: {
    level: number;
    points: number;
    badges: string[];
    role: 'expert' | 'interpreter';
  };
}

interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: Date;
  goals: string[];
}

export default function Mentorship() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([
    {
      id: '1',
      userId: 'mentor1',
      username: 'DreamMaster',
      specialties: ['Lucid Dreaming', 'Dream Interpretation', 'Nightmare Resolution'],
      experience: '5+ years of lucid dreaming practice',
      availability: 'open',
      rating: 4.8,
      reviewCount: 24,
      menteeCount: 5,
      achievements: ['Master Interpreter', 'Dream Guide'],
      reputation: {
        level: 15,
        points: 1500,
        badges: ['Expert Interpreter', 'Community Leader'],
        role: 'expert'
      }
    }
  ]);

  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [mentorshipGoals, setMentorshipGoals] = useState<string[]>([]);

  const handleRequestMentor = (mentor: Mentor) => {
    if (!requestMessage.trim() || mentorshipGoals.length === 0) return;

    const request: MentorshipRequest = {
      id: Date.now().toString(),
      menteeId: user.id,
      mentorId: mentor.id,
      status: 'pending',
      message: requestMessage,
      createdAt: new Date(),
      goals: mentorshipGoals
    };

    setRequests([...requests, request]);
    setSelectedMentor(null);
    setRequestMessage('');
    setMentorshipGoals([]);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Dream Mentorship Program</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Connect with experienced dreamers to enhance your dream practice and understanding.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {mentors.map(mentor => (
            <div key={mentor.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{mentor.username}</h3>
                  <ReputationBadge {...mentor.reputation} />
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="font-medium">{mentor.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({mentor.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Experience</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {mentor.experience}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{mentor.menteeCount} mentees</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className={`capitalize ${
                      mentor.availability === 'open' ? 'text-green-500' :
                      mentor.availability === 'limited' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {mentor.availability}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMentor(mentor)}
                  disabled={mentor.availability === 'closed'}
                  className={`w-full py-2 rounded-lg ${
                    mentor.availability === 'closed'
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Request Mentorship
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentorship Request Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              Request Mentorship from {selectedMentor.username}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Goals
                </label>
                <div className="space-y-2">
                  {mentorshipGoals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => {
                          const newGoals = [...mentorshipGoals];
                          newGoals[index] = e.target.value;
                          setMentorshipGoals(newGoals);
                        }}
                        className="flex-1 p-2 border rounded-lg"
                        placeholder="What do you want to learn?"
                      />
                      <button
                        onClick={() => setMentorshipGoals(goals => 
                          goals.filter((_, i) => i !== index)
                        )}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setMentorshipGoals([...mentorshipGoals, ''])}
                    className="text-indigo-600 text-sm"
                  >
                    + Add Goal
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message to Mentor
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Introduce yourself and explain why you'd like to work with this mentor..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSelectedMentor(null);
                    setRequestMessage('');
                    setMentorshipGoals([]);
                  }}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRequestMentor(selectedMentor)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 