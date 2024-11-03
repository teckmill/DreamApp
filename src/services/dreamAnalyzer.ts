import nlp from 'compromise';
import sentences from 'compromise-sentences';
import numbers from 'compromise-numbers';
import adjectives from 'compromise-adjectives';

// Register plugins
nlp.extend(sentences);
nlp.extend(numbers);
nlp.extend(adjectives);

// Expanded word lists and patterns for better analysis
const EMOTIONS = {
  joy: ['happy', 'joy', 'excited', 'peaceful', 'calm', 'bliss', 'delight', 'ecstatic', 'content', 'pleased', 'satisfied'],
  fear: ['scared', 'afraid', 'terrified', 'anxious', 'panic', 'dread', 'horror', 'worried', 'frightened', 'nervous'],
  anger: ['angry', 'furious', 'rage', 'mad', 'frustrated', 'annoyed', 'hostile', 'irritated', 'outraged'],
  sadness: ['sad', 'depressed', 'melancholy', 'grief', 'sorrow', 'lonely', 'despair', 'heartbroken', 'miserable'],
  surprise: ['shocked', 'amazed', 'astonished', 'unexpected', 'wonder', 'startled', 'stunned', 'bewildered'],
  love: ['love', 'affection', 'caring', 'tender', 'romantic', 'passionate', 'embrace', 'cherish', 'adore']
};

// Add animal symbolism
const ANIMALS = {
  'dog': {
    keywords: ['dog', 'puppy', 'canine'],
    symbolism: 'Dogs often represent loyalty, friendship, and protection in dreams.',
    interpretation: 'A dog in your dream might suggest faithful relationships or a need for companionship.'
  },
  'cat': {
    keywords: ['cat', 'kitten', 'feline'],
    symbolism: 'Cats typically symbolize independence, mystery, and feminine energy.',
    interpretation: 'A cat in your dream could indicate your independent nature or intuitive aspects.'
  },
  // Add more animals...
};

// Enhance dream themes
const DREAM_THEMES = {
  'animals': {
    keywords: ['dog', 'cat', 'bird', 'animal', 'pet', 'creature'],
    interpretation: 'Animals in dreams often represent different aspects of your personality or emotions.'
  },
  'journey': {
    keywords: ['travel', 'path', 'road', 'journey', 'destination', 'walking', 'moving'],
    interpretation: 'You are on a personal journey or life transition. This may represent your path in life or progress toward goals.'
  },
  'chase': {
    keywords: ['chase', 'run', 'escape', 'pursue', 'follow', 'catch', 'racing', 'fleeing'],
    interpretation: 'You may be avoiding something in your waking life or feeling pressured by responsibilities or fears.'
  },
  'vehicle': {
    keywords: ['car', 'drive', 'vehicle', 'bus', 'train', 'racing', 'transportation'],
    interpretation: 'Vehicles often represent your drive and direction in life, or how you feel about your life journey.'
  },
  // ... add more themes ...
};

const SYMBOLS = {
  water: {
    keywords: ['ocean', 'river', 'lake', 'swim', 'flood', 'rain', 'water'],
    meaning: 'Emotions, unconscious mind, or cleansing'
  },
  doors: {
    keywords: ['door', 'gate', 'entrance', 'exit', 'portal', 'threshold'],
    meaning: 'New opportunities or transitions'
  },
  vehicles: {
    keywords: ['car', 'train', 'plane', 'boat', 'bus', 'bicycle'],
    meaning: 'Life direction or personal journey'
  },
  buildings: {
    keywords: ['house', 'building', 'room', 'structure', 'architecture'],
    meaning: 'Different aspects of self or life situation'
  },
  colors: {
    red: ['red', 'crimson', 'scarlet'],
    blue: ['blue', 'azure', 'indigo'],
    green: ['green', 'emerald', 'jade'],
    black: ['black', 'dark', 'shadow'],
    white: ['white', 'light', 'bright']
  }
};

interface SymbolAnalysis {
  symbol: string;
  meaning: string;
  context: string;
}

export interface DreamAnalysis {
  sentiment: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
    emotions: string[];
  };
  themes: string[];
  symbols: SymbolAnalysis[];
  interpretation: string;
  recommendations: string[];
}

// Add more detailed patterns and contextual analysis
const CONTEXT_PATTERNS = {
  chase: {
    keywords: ['chase', 'chased', 'chasing', 'following', 'pursuing'],
    intensity: {
      high: ['long time', 'forever', 'constantly', 'relentlessly'],
      medium: ['while', 'some time', 'period'],
      low: ['briefly', 'moment', 'short']
    },
    interpretation: {
      high: 'The persistent chase suggests you may be feeling overwhelmed by ongoing pressures or responsibilities in your life.',
      medium: 'The chase represents challenges you\'re currently facing or anxieties that need attention.',
      low: 'A brief moment of tension that might reflect temporary concerns.'
    }
  },
  animals: {
    cat: {
      symbolism: 'Cats in dreams often represent independence, feminine energy, or hidden aspects of yourself.',
      contexts: {
        chase: 'Being chased by a cat might indicate you\'re running from your own intuitive nature or avoiding confronting something in your emotional life.',
        friendly: 'A friendly cat can represent self-confidence and trust in your instincts.',
        aggressive: 'An aggressive cat might symbolize repressed emotions or fears about your own independence.'
      }
    }
    // Add more animals...
  }
};

// Add activity recognition
const ACTIVITIES = {
  'playing': {
    keywords: ['play', 'playing', 'playful', 'fun', 'game', 'chase', 'together'],
    interpretation: 'Playful activities in dreams often represent joy, freedom, and harmonious relationships.',
    sentiment: 'positive'
  },
  'fighting': {
    keywords: ['fight', 'fighting', 'conflict', 'battle', 'argument', 'aggressive'],
    interpretation: 'Conflict in dreams may represent internal struggles or real-life tensions.',
    sentiment: 'negative'
  },
  'interacting': {
    keywords: ['together', 'interaction', 'meeting', 'communicating', 'sharing'],
    interpretation: 'Interaction between different elements suggests integration of different aspects of yourself.',
    sentiment: 'neutral'
  }
};

// Add relationship dynamics
const RELATIONSHIPS = {
  'harmony': {
    keywords: ['friendly', 'peaceful', 'together', 'harmonious', 'playing', 'cooperation'],
    interpretation: 'Harmonious relationships in dreams suggest inner peace and balanced aspects of yourself.'
  },
  'conflict': {
    keywords: ['fighting', 'chase', 'hostile', 'aggressive', 'avoiding'],
    interpretation: 'Conflict between dream elements may represent internal conflicts or real-life tensions.'
  }
};

// Add action recognition
const ACTIONS = {
  'fighting': {
    keywords: ['fight', 'fighting', 'fought', 'battle', 'conflict', 'attacking', 'attacked'],
    sentiment: 'negative',
    interpretation: 'Conflict or aggression in dreams often represents internal struggles or unresolved tensions.',
    emotions: ['tension', 'anger', 'conflict']
  },
  'playing': {
    keywords: ['play', 'playing', 'played', 'fun', 'friendly', 'together'],
    sentiment: 'positive',
    interpretation: 'Playful interaction suggests harmony and positive relationships in your life.',
    emotions: ['joy', 'peace']
  }
};

const OPENROUTER_API_KEY = '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';

export const dreamAnalyzer = {
  async analyzeDream(text: string): Promise<DreamAnalysis> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct', // Free model
          messages: [
            {
              role: 'system',
              content: `You are a dream analysis expert. Analyze dreams and provide:
                1. Sentiment and emotions
                2. Main themes
                3. Interpretation
                4. Recommendations
                Format the response as JSON with these keys: sentiment, themes, interpretation, recommendations`
            },
            {
              role: 'user',
              content: `Analyze this dream: ${text}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze dream');
      }

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);

      // Format the response to match our interface
      return {
        sentiment: {
          score: analysis.sentiment.includes('positive') ? 1 : 
                 analysis.sentiment.includes('negative') ? -1 : 0,
          label: analysis.sentiment.includes('positive') ? 'positive' : 
                 analysis.sentiment.includes('negative') ? 'negative' : 'neutral',
          emotions: Array.isArray(analysis.emotions) ? analysis.emotions : []
        },
        themes: Array.isArray(analysis.themes) ? analysis.themes : [],
        interpretation: analysis.interpretation || 'No interpretation available',
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : []
      };
    } catch (error) {
      console.error('Dream analysis error:', error);
      // Fallback to basic analysis if API fails
      return this.fallbackAnalysis(text);
    }
  },

  // Fallback analysis in case the API fails
  fallbackAnalysis(text: string): DreamAnalysis {
    const textLower = text.toLowerCase();
    
    // Basic sentiment analysis
    const positiveWords = ['happy', 'joy', 'peaceful', 'love', 'exciting'];
    const negativeWords = ['scary', 'fear', 'nightmare', 'anxiety', 'stress'];
    
    let sentimentScore = 0;
    positiveWords.forEach(word => {
      if (textLower.includes(word)) sentimentScore++;
    });
    negativeWords.forEach(word => {
      if (textLower.includes(word)) sentimentScore--;
    });

    return {
      sentiment: {
        score: sentimentScore,
        label: sentimentScore > 0 ? 'positive' : 
               sentimentScore < 0 ? 'negative' : 'neutral',
        emotions: []
      },
      themes: ['general'],
      interpretation: 'Unable to perform detailed analysis at this time.',
      recommendations: [
        'Record more details about this dream in your journal',
        'Reflect on how this dream relates to your current life situation'
      ]
    };
  }
}; 