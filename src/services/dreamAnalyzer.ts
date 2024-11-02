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

export const dreamAnalyzer = {
  analyzeDream(text: string): DreamAnalysis {
    const textLower = text.toLowerCase();
    
    // Enhanced emotion detection
    const emotions = new Set<string>();
    Object.entries(EMOTIONS).forEach(([category, words]) => {
      if (words.some(word => textLower.includes(word))) {
        emotions.add(category);
      }
    });

    // Enhanced theme detection
    const themes = Object.entries(DREAM_THEMES)
      .filter(([_, data]) => 
        data.keywords.some(keyword => textLower.includes(keyword)))
      .map(([theme, data]) => ({
        name: theme,
        interpretation: data.interpretation
      }));

    // Generate detailed interpretation
    let interpretation = '';
    if (themes.length > 0) {
      interpretation = themes
        .map(theme => theme.interpretation)
        .join(' ');
    } else {
      interpretation = 'This dream appears to be exploring personal experiences and emotions. Consider keeping track of recurring elements for deeper insight.';
    }

    // Generate personalized recommendations
    const recommendations = [
      'Record any emotions or feelings you experienced during the dream',
      'Note any symbols or objects that stood out to you',
      'Consider how this dream might relate to your current life situation',
      'Look for patterns or recurring themes in your dreams'
    ];

    // Add theme-specific recommendations
    themes.forEach(theme => {
      recommendations.push(
        `Reflect on the ${theme.name} elements in your dream and their significance`,
        `Consider how the ${theme.name} theme relates to your waking life`
      );
    });

    // Calculate sentiment
    let sentimentScore = 0;
    EMOTIONS.joy.forEach(word => {
      if (textLower.includes(word)) sentimentScore += 1;
    });
    EMOTIONS.fear.forEach(word => {
      if (textLower.includes(word)) sentimentScore -= 1;
    });
    EMOTIONS.anger.forEach(word => {
      if (textLower.includes(word)) sentimentScore -= 1;
    });

    return {
      sentiment: {
        score: sentimentScore,
        label: sentimentScore > 0 ? 'positive' : 
               sentimentScore < 0 ? 'negative' : 'neutral',
        emotions: Array.from(emotions)
      },
      themes: themes.map(t => t.name),
      interpretation,
      recommendations: Array.from(new Set(recommendations))
    };
  }
}; 