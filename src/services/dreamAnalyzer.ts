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

export const dreamAnalyzer = {
  analyzeDream(text: string): DreamAnalysis {
    const words = text.toLowerCase().split(/\W+/);
    const wordSet = new Set(words);

    // Analyze emotions and sentiment
    const emotions = new Set<string>();
    let sentimentScore = 0;
    let emotionCounts = 0;

    Object.entries(EMOTIONS).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        if (wordSet.has(keyword)) {
          emotions.add(emotion);
          sentimentScore += (emotion === 'joy' || emotion === 'love') ? 1 : 
                           (emotion === 'fear' || emotion === 'anger' || emotion === 'sadness') ? -1 : 0;
          emotionCounts++;
        }
      });
    });

    // Normalize sentiment score
    sentimentScore = emotionCounts > 0 ? sentimentScore / emotionCounts : 0;

    // Analyze themes
    const themes = Object.entries(DREAM_THEMES)
      .filter(([_, { keywords }]) => 
        keywords.some(keyword => text.toLowerCase().includes(keyword)))
      .map(([theme]) => theme);

    // Analyze symbols
    const symbols: SymbolAnalysis[] = [];
    Object.entries(SYMBOLS).forEach(([category, data]) => {
      if ('keywords' in data) {
        const symbolData = data as { keywords: string[], meaning: string };
        const found = symbolData.keywords.some(keyword => text.toLowerCase().includes(keyword));
        if (found) {
          symbols.push({
            symbol: category,
            meaning: symbolData.meaning,
            context: this.extractContext(text, symbolData.keywords)
          });
        }
      }
    });

    // Generate interpretation
    const interpretation = this.generateInterpretation(themes, symbols, emotions);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(themes, emotions, sentimentScore);

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

    // Add theme interpretations
    themes.forEach(theme => {
      interpretation += DREAM_THEMES[theme as keyof typeof DREAM_THEMES].interpretation + ' ';
    });

    // Add symbol interpretations
    if (symbols.length > 0) {
      interpretation += 'The presence of ' + 
        symbols.map(s => `${s.symbol} (${s.meaning})`).join(' and ') + 
        ' suggests deeper meaning in these areas. ';
    }

    // Add emotional interpretation
    if (emotions.size > 0) {
      interpretation += `The dream's emotional landscape of ${Array.from(emotions).join(', ')} ` +
        'indicates your current emotional processing. ';
    }

    return interpretation.trim() || 'This dream suggests a complex interplay of your thoughts and emotions.';
  },

  generateRecommendations(themes: string[], emotions: Set<string>, sentiment: number): string[] {
    const recommendations = [
      'Record more details about this dream in your journal',
      'Reflect on how this dream relates to your current life situation'
    ];

    // Theme-based recommendations
    if (themes.includes('transformation')) {
      recommendations.push('Consider what changes you might want to embrace in your life');
    }
    if (themes.includes('relationships')) {
      recommendations.push('Reflect on your current relationships and connections');
    }
    if (themes.includes('conflict')) {
      recommendations.push('Examine what conflicts in your life need resolution');
    }

    // Emotion-based recommendations
    if (emotions.has('fear') || emotions.has('anxiety')) {
      recommendations.push('Practice relaxation techniques before bed');
      recommendations.push('Consider discussing your concerns with someone you trust');
    }
    if (emotions.has('joy') || emotions.has('love')) {
      recommendations.push('Celebrate and appreciate the positive aspects of your life');
    }

    return recommendations;
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
  }
}; 