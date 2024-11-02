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

export const dreamAnalyzer = {
  analyzeDream(text: string): DreamAnalysis {
    const textLower = text.toLowerCase();
    const words = textLower.split(/\s+/);
    
    // Detect animals and their context
    const animals = Object.entries(ANIMALS)
      .filter(([_, data]) => 
        data.keywords.some(keyword => textLower.includes(keyword)))
      .map(([animal, data]) => ({
        type: animal,
        symbolism: data.symbolism,
        interpretation: data.interpretation
      }));

    // Detect activities
    const activities = Object.entries(ACTIVITIES)
      .filter(([_, data]) => 
        data.keywords.some(keyword => textLower.includes(keyword)))
      .map(([activity, data]) => ({
        type: activity,
        interpretation: data.interpretation,
        sentiment: data.sentiment
      }));

    // Detect relationships
    const relationships = Object.entries(RELATIONSHIPS)
      .filter(([_, data]) => 
        data.keywords.some(keyword => textLower.includes(keyword)))
      .map(([type, data]) => ({
        type,
        interpretation: data.interpretation
      }));

    // Calculate sentiment based on activities and relationships
    let sentimentScore = 0;
    const emotions = new Set<string>();

    activities.forEach(activity => {
      if (activity.sentiment === 'positive') {
        sentimentScore += 1;
        emotions.add('joy');
      } else if (activity.sentiment === 'negative') {
        sentimentScore -= 1;
        emotions.add('tension');
      }
    });

    relationships.forEach(rel => {
      if (rel.type === 'harmony') {
        sentimentScore += 1;
        emotions.add('peace');
      } else if (rel.type === 'conflict') {
        sentimentScore -= 1;
        emotions.add('conflict');
      }
    });

    // Generate comprehensive interpretation
    let interpretation = '';

    // Add animal symbolism
    if (animals.length > 0) {
      interpretation += animals
        .map(animal => animal.interpretation)
        .join(' ') + ' ';
    }

    // Add activity interpretation
    if (activities.length > 0) {
      interpretation += activities
        .map(activity => activity.interpretation)
        .join(' ') + ' ';
    }

    // Add relationship dynamics
    if (relationships.length > 0) {
      interpretation += relationships
        .map(rel => rel.interpretation)
        .join(' ') + ' ';
    }

    // Generate specific recommendations
    const recommendations = [
      'Record more details about this dream in your journal',
      'Reflect on how this dream relates to your current life situation'
    ];

    // Add context-specific recommendations
    if (animals.length > 0) {
      recommendations.push(
        'Consider your relationship with these animals in waking life',
        'Reflect on what qualities of these animals resonate with you'
      );
    }

    if (activities.length > 0) {
      recommendations.push(
        `Consider how the ${activities.map(a => a.type).join('/')} activities reflect your current life situation`,
        'Think about how these activities make you feel in both dreams and waking life'
      );
    }

    if (relationships.length > 0) {
      recommendations.push(
        'Examine the relationship dynamics in your waking life',
        'Consider how these dream interactions mirror your real relationships'
      );
    }

    return {
      sentiment: {
        score: sentimentScore / (activities.length + relationships.length || 1),
        label: sentimentScore > 0.2 ? 'positive' : 
               sentimentScore < -0.2 ? 'negative' : 'neutral',
        emotions: Array.from(emotions)
      },
      themes: [
        ...animals.map(a => a.type),
        ...activities.map(a => a.type),
        ...relationships.map(r => r.type)
      ],
      interpretation: interpretation.trim(),
      recommendations: Array.from(new Set(recommendations)) // Remove duplicates
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