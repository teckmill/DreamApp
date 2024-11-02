// Expanded word lists and patterns for better analysis
const EMOTIONS = {
  joy: ['happy', 'joy', 'excited', 'peaceful', 'calm', 'bliss', 'delight', 'ecstatic', 'content'],
  fear: ['scared', 'afraid', 'terrified', 'anxious', 'panic', 'dread', 'horror', 'worried'],
  anger: ['angry', 'furious', 'rage', 'mad', 'frustrated', 'annoyed', 'hostile'],
  sadness: ['sad', 'depressed', 'melancholy', 'grief', 'sorrow', 'lonely', 'despair'],
  surprise: ['shocked', 'amazed', 'astonished', 'unexpected', 'wonder', 'startled'],
  love: ['love', 'affection', 'caring', 'tender', 'romantic', 'passionate', 'embrace']
};

const DREAM_THEMES = {
  transformation: {
    keywords: ['change', 'transform', 'grow', 'evolve', 'metamorphosis', 'different', 'becoming'],
    interpretation: 'Personal growth and life changes are prominent in your mind.'
  },
  adventure: {
    keywords: ['journey', 'quest', 'explore', 'discover', 'travel', 'adventure', 'unknown'],
    interpretation: 'You may be seeking new experiences or facing life challenges.'
  },
  relationships: {
    keywords: ['friend', 'family', 'lover', 'partner', 'marriage', 'relationship', 'connection'],
    interpretation: 'Your relationships and connections with others are significant.'
  },
  conflict: {
    keywords: ['fight', 'chase', 'escape', 'battle', 'conflict', 'struggle', 'compete'],
    interpretation: 'You might be dealing with internal or external conflicts.'
  },
  nature: {
    keywords: ['forest', 'ocean', 'mountain', 'garden', 'tree', 'flower', 'animal', 'nature'],
    interpretation: 'You may be seeking harmony with your natural self or environment.'
  },
  power: {
    keywords: ['control', 'strength', 'power', 'leader', 'authority', 'influence', 'ability'],
    interpretation: 'Issues of personal power and control are present.'
  },
  spirituality: {
    keywords: ['spirit', 'god', 'divine', 'sacred', 'meditation', 'prayer', 'enlightenment'],
    interpretation: 'Spiritual growth or questioning may be important to you.'
  },
  freedom: {
    keywords: ['fly', 'float', 'soar', 'free', 'release', 'escape', 'liberate', 'unlimited'],
    interpretation: 'You may be seeking freedom or release from constraints.'
  }
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
    const words = text.toLowerCase().split(/\W+/);
    const wordSet = new Set(words);
    const textLower = text.toLowerCase();

    // Analyze emotions and sentiment with more context
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

    // Normalize sentiment score
    sentimentScore = emotionCounts > 0 ? sentimentScore / emotionCounts : 0;

    // Detect themes with context
    const themes = Object.entries(DREAM_THEMES)
      .filter(([_, { keywords }]) => 
        keywords.some(keyword => textLower.includes(keyword)))
      .map(([theme]) => theme);

    // Analyze symbols with context
    const symbols: SymbolAnalysis[] = [];
    Object.entries(SYMBOLS).forEach(([category, data]) => {
      if ('keywords' in data) {
        const symbolData = data as { keywords: string[], meaning: string };
        const found = symbolData.keywords.some(keyword => textLower.includes(keyword));
        if (found) {
          const context = this.extractContext(text, symbolData.keywords);
          symbols.push({
            symbol: category,
            meaning: symbolData.meaning,
            context
          });
        }
      }
    });

    // Check for specific patterns
    if (textLower.includes('chase') || textLower.includes('running')) {
      const intensity = this.determineChaseIntensity(text);
      const interpretation = CONTEXT_PATTERNS.chase.interpretation[intensity];
      themes.push('pursuit');
      if (!symbols.some(s => s.symbol === 'chase')) {
        symbols.push({
          symbol: 'chase',
          meaning: 'Avoidance or confrontation of issues',
          context: interpretation
        });
      }
    }

    // Animal symbolism
    if (textLower.includes('cat')) {
      const catContext = textLower.includes('chase') ? 'chase' :
                        textLower.includes('attack') || textLower.includes('scratch') ? 'aggressive' : 'friendly';
      symbols.push({
        symbol: 'cat',
        meaning: CONTEXT_PATTERNS.animals.cat.symbolism,
        context: CONTEXT_PATTERNS.animals.cat.contexts[catContext]
      });
    }

    // Generate comprehensive interpretation
    const interpretation = this.generateInterpretation(themes, symbols, emotions);
    
    // Generate targeted recommendations
    const recommendations = this.generateRecommendations(themes, emotions, sentimentScore, symbols);

    return {
      sentiment: {
        score: sentimentScore,
        label: sentimentScore > 0.2 ? 'positive' : sentimentScore < -0.2 ? 'negative' : 'neutral',
        emotions: Array.from(emotions)
      },
      themes,
      symbols,
      interpretation,
      recommendations
    };
  },

  extractContext(text: string, keywords: string[]): string {
    const sentences = text.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        return sentence.trim();
      }
    }
    return '';
  },

  generateInterpretation(themes: string[], symbols: SymbolAnalysis[], emotions: Set<string>): string {
    let interpretation = '';

    // Theme interpretation
    themes.forEach(theme => {
      interpretation += DREAM_THEMES[theme as keyof typeof DREAM_THEMES].interpretation + ' ';
    });

    // Symbol interpretation
    if (symbols.length > 0) {
      interpretation += 'Your dream features ' + 
        symbols.map(s => `${s.symbol} (${s.meaning})`).join(' and ') + 
        ', suggesting ' +
        symbols.map(s => s.context).join('. ') + '. ';
    }

    // Emotional interpretation
    if (emotions.size > 0) {
      interpretation += `The presence of ${Array.from(emotions).join(', ')} emotions ` +
        'suggests you are processing these feelings in your waking life. ';
    }

    return interpretation.trim() || 'This dream suggests a complex interplay of your thoughts and emotions.';
  },

  generateRecommendations(
    themes: string[], 
    emotions: Set<string>, 
    sentiment: number,
    symbols: SymbolAnalysis[]
  ): string[] {
    const recommendations = new Set([
      'Record more details about this dream in your journal',
      'Reflect on how this dream relates to your current life situation'
    ]);

    // Theme-based recommendations
    themes.forEach(theme => {
      switch (theme) {
        case 'transformation':
          recommendations.add('Consider what changes you might want to embrace in your life');
          recommendations.add('Look for areas where personal growth is occurring');
          break;
        case 'conflict':
          recommendations.add('Examine what conflicts in your life need resolution');
          recommendations.add('Consider if you\'re avoiding any important confrontations');
          break;
        case 'pursuit':
          recommendations.add('Reflect on what you might be running from in your waking life');
          recommendations.add('Consider what pressures you\'re currently facing');
          break;
        // Add more theme-specific recommendations...
      }
    });

    // Symbol-based recommendations
    symbols.forEach(symbol => {
      if (symbol.symbol === 'water') {
        recommendations.add('Pay attention to your emotional well-being');
      }
      if (symbol.symbol === 'cat') {
        recommendations.add('Consider your relationship with independence and intuition');
      }
    });

    // Emotion-based recommendations
    if (emotions.has('fear') || emotions.has('anxiety')) {
      recommendations.add('Practice relaxation techniques before bed');
      recommendations.add('Consider discussing your concerns with someone you trust');
    }
    if (emotions.has('anger')) {
      recommendations.add('Explore healthy ways to express and process your anger');
    }

    return Array.from(recommendations);
  },

  generateDreamArtwork(themes: string[]): string {
    const artElements = {
      transformation: '🦋',
      adventure: '🌄',
      relationships: '💫',
      conflict: '⚔️',
      nature: '🌿',
      power: '⚡',
      spirituality: '✨',
      freedom: '🕊️'
    };

    return themes
      .map(theme => artElements[theme as keyof typeof artElements])
      .filter(Boolean)
      .join(' ') || '💭';
  },

  determineChaseIntensity(text: string): 'high' | 'medium' | 'low' {
    const lowercaseText = text.toLowerCase();
    
    for (const [intensity, phrases] of Object.entries(CONTEXT_PATTERNS.chase.intensity)) {
      if (phrases.some(phrase => lowercaseText.includes(phrase))) {
        return intensity as 'high' | 'medium' | 'low';
      }
    }
    
    return 'medium';
  }
}; 