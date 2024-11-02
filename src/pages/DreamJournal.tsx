import React, { useState } from 'react';
import { PenSquare, Calendar, Tag, Mic, Send, Sparkles, Brain, Trash2, X } from 'lucide-react';
import { dreamAnalyzer, type DreamAnalysis } from '../services/dreamAnalyzer';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface DreamEntry {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  date: Date;
  analysis?: DreamAnalysis;
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
    
    try {
      const result = dreamAnalyzer.analyzeDream(dreamText);
      console.log('Analysis result:', result); // Debug logging
      setAnalysis(result);
      setShowAnalysis(true);

      // Automatically add relevant tags based on themes
      const themeTags = result.themes.filter(theme => commonTags.includes(theme.toLowerCase()));
      setSelectedTags(prev => [...new Set([...prev, ...themeTags])]);
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  const handleSave = () => {
    if (!dreamText.trim()) return;

    try {
      // Get or create analysis
      const dreamAnalysis = analysis || dreamAnalyzer.analyzeDream(dreamText);
      
      const newDream: DreamEntry = {
        id: editingDream || Date.now().toString(),
        userId: user.id,
        content: dreamText,
        tags: selectedTags,
        date: selectedDate,
        analysis: dreamAnalysis
      };

      if (editingDream) {
        setDreams(dreams.map(dream => 
          dream.id === editingDream ? newDream : dream
        ));
        setEditingDream(null);
      } else {
        setDreams([newDream, ...dreams]);
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
        {dreams.map((dream) => (
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
    </div>
  );
}