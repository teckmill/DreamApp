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

const DREAM_THEMES = {
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

export const dreamAnalyzer = {
  analyzeDream(text: string): DreamAnalysis {
    const textLower = text.toLowerCase();
    const words = textLower.split(/\W+/);
    
    // Enhanced emotion detection
    const emotions = new Set<string>();
    let sentimentScore = 0;
    let emotionCounts = 0;
    
    Object.entries(EMOTIONS).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        if (textLower.includes(keyword)) {
          emotions.add(emotion);
          sentimentScore += (emotion === 'joy' || emotion === 'love') ? 1 : 
                           (emotion === 'fear' || emotion === 'anger' || emotion === 'sadness') ? -1 : 0;
          emotionCounts++;
        }
      });
    });

    // Enhanced theme detection
    const themes = Object.entries(DREAM_THEMES)
      .filter(([_, { keywords }]) => 
        keywords.some(keyword => textLower.includes(keyword)))
      .map(([theme]) => theme);

    // Generate detailed interpretation
    let interpretation = '';
    
    // Add theme interpretations
    themes.forEach(theme => {
      interpretation += DREAM_THEMES[theme as keyof typeof DREAM_THEMES].interpretation + ' ';
    });

    // Add emotional context
    if (emotions.size > 0) {
      interpretation += `The presence of ${Array.from(emotions).join(' and ')} suggests `;
      if (emotions.has('fear')) {
        interpretation += 'you may be processing anxieties or concerns. ';
      }
      if (emotions.has('joy')) {
        interpretation += 'you are experiencing positive developments or anticipation. ';
      }
      // ... add more emotion interpretations ...
    }

    // Generate specific recommendations
    const recommendations = [
      'Record more details about this dream in your journal',
      'Reflect on how this dream relates to your current life situation'
    ];

    // Add theme-specific recommendations
    themes.forEach(theme => {
      switch (theme) {
        case 'journey':
          recommendations.push(
            'Consider what goals you are currently pursuing',
            'Reflect on your life direction and choices'
          );
          break;
        case 'chase':
          recommendations.push(
            'Identify what you might be avoiding in your waking life',
            'Consider what pressures you are currently facing'
          );
          break;
        case 'vehicle':
          recommendations.push(
            'Think about how you feel about your current life direction',
            'Consider if you feel in control of your life journey'
          );
          break;
      }
    });

    // Add emotion-based recommendations
    if (emotions.has('fear')) {
      recommendations.push(
        'Practice relaxation techniques before bed',
        'Address any current anxieties in your waking life'
      );
    }

    return {
      sentiment: {
        score: emotionCounts > 0 ? sentimentScore / emotionCounts : 0,
        label: sentimentScore > 0.2 ? 'positive' : 
               sentimentScore < -0.2 ? 'negative' : 'neutral',
        emotions: Array.from(emotions)
      },
      themes,
      interpretation: interpretation.trim() || 'This dream suggests deeper patterns in your subconscious mind.',
      recommendations: recommendations.filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    };
  },

  generateDreamArtwork(themes: string[]): string {
    const artElements = {
      journey: '🛣️',
      chase: '🏃',
      vehicle: '🚗',
      flying: '🦋',
      water: '🌊',
      nature: '🌿',
      relationships: '💫',
      transformation: '🦋'
    };

    return themes
      .map(theme => artElements[theme as keyof typeof artElements])
      .filter(Boolean)
      .join(' ') || '💭';
  }
}; 