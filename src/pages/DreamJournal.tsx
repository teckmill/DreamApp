import React, { useState } from 'react';
import { PenSquare, Calendar, Tag, Mic, Send, Sparkles, Brain } from 'lucide-react';
import { dreamAnalyzer, type DreamAnalysis } from '../services/dreamAnalyzer';

export default function DreamJournal() {
  const [isRecording, setIsRecording] = useState(false);
  const [dreamText, setDreamText] = useState('');
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalyze = () => {
    if (!dreamText.trim()) return;
    const result = dreamAnalyzer.analyzeDream(dreamText);
    setAnalysis(result);
    setShowAnalysis(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dream Journal</h1>
        <p className="text-gray-600 dark:text-gray-300">Record and reflect on your dreams</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-1">
            <textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder="Describe your dream..."
              className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            Set Date
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Tag className="h-4 w-4 mr-2" />
            Add Tags
          </button>
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Mic className="h-4 w-4 mr-2" />
            {isRecording ? 'Recording...' : 'Record'}
          </button>
          <button
            onClick={handleAnalyze}
            className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors"
          >
            <Brain className="h-4 w-4 mr-2" />
            Analyze Dream
          </button>
          <button className="ml-auto inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Send className="h-4 w-4 mr-2" />
            Save Entry
          </button>
        </div>
      </div>

      {showAnalysis && analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Dream Analysis
          </h2>
          
          <div className="space-y-4">
            <div className="text-center text-4xl mb-4">
              {dreamAnalyzer.generateDreamArtwork(analysis.themes)}
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Sentiment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {analysis.sentiment.label} ({analysis.sentiment.emotions.join(', ')})
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Themes</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme) => (
                  <span
                    key={theme}
                    className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-full"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Interpretation</h3>
              <p className="text-gray-600 dark:text-gray-300">{analysis.interpretation}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">March {index + 1}, 2024</span>
              </div>
              <button className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <PenSquare className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {index === 0
                ? "I found myself flying over a crystal-clear ocean, the water below reflecting the starlit sky..."
                : index === 1
                ? "Walking through an ancient library where the books whispered their secrets..."
                : "In a garden where flowers changed colors with my emotions..."}
            </p>
            <div className="flex flex-wrap gap-2">
              {['Lucid', 'Flying', 'Nature'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}