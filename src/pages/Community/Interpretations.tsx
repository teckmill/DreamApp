import React, { useState } from 'react';
import { Brain, MessageCircle, ThumbsUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReputationBadge from '../../components/community/ReputationBadge';

interface InterpretationRequest {
  id: string;
  userId: string;
  username: string;
  dreamContent: string;
  createdAt: Date;
  responses: InterpretationResponse[];
  status: 'open' | 'resolved';
  tags: string[];
}

interface InterpretationResponse {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
  likes: Set<string>;
  userReputation: {
    level: number;
    points: number;
    badges: string[];
    role: 'member' | 'interpreter' | 'moderator' | 'expert';
  };
}

export default function Interpretations() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<InterpretationRequest[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmitRequest = () => {
    if (!newRequest.trim()) return;

    const request: InterpretationRequest = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      dreamContent: newRequest,
      createdAt: new Date(),
      responses: [],
      status: 'open',
      tags: selectedTags
    };

    setRequests([request, ...requests]);
    setNewRequest('');
    setSelectedTags([]);
  };

  const handleSubmitResponse = (requestId: string, content: string) => {
    setRequests(requests.map(request => {
      if (request.id === requestId) {
        const response: InterpretationResponse = {
          id: Date.now().toString(),
          userId: user.id,
          username: user.username,
          content,
          createdAt: new Date(),
          likes: new Set(),
          userReputation: {
            level: 1,
            points: 100,
            badges: ['Interpreter'],
            role: 'interpreter'
          }
        };
        return {
          ...request,
          responses: [...request.responses, response]
        };
      }
      return request;
    }));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Request Dream Interpretation</h2>
        <textarea
          value={newRequest}
          onChange={(e) => setNewRequest(e.target.value)}
          placeholder="Share your dream for interpretation..."
          className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg resize-none mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmitRequest}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Request Interpretation
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {requests.map(request => (
          <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{request.username}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  request.status === 'open'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {request.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{request.dreamContent}</p>
            </div>

            {/* Responses */}
            <div className="space-y-4">
              {request.responses.map(response => (
                <div key={response.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{response.username}</span>
                      <ReputationBadge {...response.userReputation} />
                    </div>
                    <button className="text-gray-500 hover:text-indigo-600">
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{response.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 