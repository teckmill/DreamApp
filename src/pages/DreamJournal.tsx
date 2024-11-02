import React, { useState, useEffect } from 'react';
import { PenSquare, Calendar, Tag, Mic, Send, Brain, Trash2, X, Loader, Search, Filter, Star, Sparkles, BarChart } from 'lucide-react';
import { dreamAnalyzer } from '../services/dreamAnalyzer';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { subscriptionService } from '../services/subscriptionService';
import { rewardService } from '../services/rewardService';

interface DreamEntry {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  date: Date;
  analysis?: DreamAnalysis;
  category: string;
  mood: number;
  clarity: number;
  isRecurring: boolean;
}

export default function DreamJournal() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [dreamText, setDreamText] = useState('');
  const [analysis, setAnalysis] = useState<DreamAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [editingDream, setEditingDream] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showStats, setShowStats] = useState(false);
  const [mood, setMood] = useState(3);
  const [clarity, setClarity] = useState(3);
  const [isRecurring, setIsRecurring] = useState(false);
  const [category, setCategory] = useState('general');

  // In a real app, this would be fetched from a backend
  const [dreams, setDreams] = useState<DreamEntry[]>(() => {
    const savedDreams = localStorage.getItem(`dreams_${user.id}`);
    return savedDreams ? JSON.parse(savedDreams) : [];
  });

  // Save dreams to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem(`dreams_${user.id}`, JSON.stringify(dreams));
  }, [dreams, user.id]);

  const handleAnalyze = () => {
    if (!dreamText.trim()) return;

    // Check if user has analysis credits or premium time
    if (!rewardService.canUseAnalysis(user.id)) {
      alert('You need analysis credits to analyze dreams. Watch ads or upgrade to get more credits!');
      return;
    }

    try {
      const result = dreamAnalyzer.analyzeDream(dreamText);
      setAnalysis(result);
      setShowAnalysis(true);
      
      // Use an analysis credit (premium users don't use credits)
      rewardService.useAnalysisCredit(user.id);

      // Scroll to analysis section
      const analysisSection = document.getElementById('analysis-section');
      if (analysisSection) {
        analysisSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  const handleSave = () => {
    if (!dreamText.trim()) return;

    // Check dream storage limit
    if (!subscriptionService.checkLimit(user.id, 'dreamsPerMonth')) {
      alert('You have reached your monthly dream storage limit. Watch ads or upgrade to store more dreams!');
      return;
    }

    try {
      // Get or create analysis
      const dreamAnalysis = analysis || dreamAnalyzer.analyzeDream(dreamText);
      
      const newDream: DreamEntry = {
        id: editingDream || Date.now().toString(),
        userId: user.id,
        content: dreamText,
        tags: selectedTags,
        date: selectedDate,
        analysis: dreamAnalysis,
        category: 'lucid',
        mood: 3,
        clarity: 3,
        isRecurring: false
      };

      if (editingDream) {
        setDreams(dreams.map(dream => 
          dream.id === editingDream ? newDream : dream
        ));
        setEditingDream(null);
      } else {
        setDreams([newDream, ...dreams]);
        subscriptionService.incrementUsage(user.id, 'dreamsPerMonth');
      }

      // Reset form
      setDreamText('');
      setSelectedTags([]);
      setAnalysis(null);
      setShowAnalysis(false);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleEdit = (dream: DreamEntry) => {
    setDreamText(dream.content);
    setSelectedTags(dream.tags);
    setEditingDream(dream.id);
    setAnalysis(dream.analysis || null);
    setShowAnalysis(!!dream.analysis);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (dreamId: string) => {
    if (window.confirm('Are you sure you want to delete this dream?')) {
      setDreams(dreams.filter(dream => dream.id !== dreamId));
      if (editingDream === dreamId) {
        setEditingDream(null);
        setDreamText('');
        setSelectedTags([]);
        setAnalysis(null);
        setShowAnalysis(false);
      }
    }
  };

  const commonTags = ['lucid', 'nightmare', 'flying', 'falling', 'chase', 'water', 'family'];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  // Enhanced export functionality
  const handleExport = () => {
    if (!subscriptionService.hasFeature(user.id, 'exportData')) {
      alert('Export is a premium feature. Watch ads or upgrade to access this feature!');
      return;
    }

    try {
      const exportData = {
        dreams: dreams.map(dream => ({
          ...dream,
          date: new Date(dream.date).toISOString(),
          tags: Array.from(dream.tags)
        })),
        exportDate: new Date().toISOString(),
        user: {
          username: user.username,
          id: user.id
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dreamscape-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export dreams. Please try again.');
    }
  };

  const userRewards = rewardService.getUserRewards(user.id);
  const currentTier = subscriptionService.getUserSubscription(user.id);

  // Add usage stats
  const dreamsThisMonth = subscriptionService.getUsage(user.id, 'dreamsPerMonth');
  const analysisThisMonth = subscriptionService.getUsage(user.id, 'analysisPerMonth');

  const categories = [
    'general',
    'lucid',
    'nightmare',
    'adventure',
    'spiritual',
    'prophetic',
    'recurring'
  ];

  const moodEmojis = ['😔', '😕', '😐', '🙂', '😊'];
  const clarityStars = [1, 2, 3, 4, 5];

  // Filter dreams
  const filteredDreams = dreams.filter(dream => {
    const matchesSearch = dream.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dream.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || dream.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const dreamStats = React.useMemo(() => {
    return {
      totalDreams: dreams.length,
      averageMood: dreams.reduce((sum, dream) => sum + dream.mood, 0) / dreams.length || 0,
      averageClarity: dreams.reduce((sum, dream) => sum + dream.clarity, 0) / dreams.length || 0,
      categoryBreakdown: dreams.reduce((acc, dream) => {
        acc[dream.category] = (acc[dream.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recurringCount: dreams.filter(dream => dream.isRecurring).length,
      monthlyCount: dreams.reduce((acc, dream) => {
        const month = new Date(dream.date).toLocaleString('default', { month: 'long' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [dreams]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dream Journal</h1>
        <p className="text-gray-600 dark:text-gray-300">
          {editingDream ? 'Edit your dream entry' : 'Record and reflect on your dreams'}
        </p>
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

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {format(selectedDate, 'MMM d, yyyy')}
            </button>

            {showDatePicker && (
              <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => handleDateSelect(new Date(e.target.value))}
                  className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
          </div>
          
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
          {editingDream && (
            <button
              onClick={() => {
                setEditingDream(null);
                setDreamText('');
                setSelectedTags([]);
                setAnalysis(null);
                setShowAnalysis(false);
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Edit
            </button>
          )}
          <button
            onClick={handleSave}
            className="ml-auto inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Send className="h-4 w-4 mr-2" />
            {editingDream ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </div>

      {showAnalysis && analysis && (
        <div id="analysis-section" className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 mt-8">
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
        {filteredDreams.map((dream) => (
          <div
            key={dream.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(dream.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(dream)}
                  className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <PenSquare className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(dream.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {dream.content}
            </p>
            <div className="flex flex-wrap gap-2">
              {dream.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Dream Journal Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Dreams</h3>
            {currentTier.limits.dreamsPerMonth === -1 ? (
              <p className="text-green-600 dark:text-green-400">Unlimited dreams available</p>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentTier.limits.dreamsPerMonth - dreamsThisMonth} dreams remaining this month
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(dreamsThisMonth / currentTier.limits.dreamsPerMonth) * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Analysis Credits</h3>
            {userRewards.premiumTimeLeft > 0 ? (
              <p className="text-green-600 dark:text-green-400">
                Unlimited analysis (Premium active: {userRewards.premiumTimeLeft}h)
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                {userRewards.analysisCredits} analysis credits available
              </p>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Features</h3>
            <ul className="text-sm space-y-1">
              <li className="flex items-center">
                <span className={currentTier.features.exportData ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                  • Export Data
                </span>
                {currentTier.features.exportData && (
                  <button
                    onClick={handleExport}
                    className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Export Now
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Add upgrade prompt if on basic plan */}
        {currentTier.name === 'Basic' && (
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-indigo-600 dark:text-indigo-400">
              Want unlimited dreams and analysis? 
              <Link to="/subscription" className="ml-2 underline">
                Watch ads to unlock premium features
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}