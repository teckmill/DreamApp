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
    const doc = nlp(text);
    const sentences = doc.sentences().json();
    const nouns = doc.nouns().json();
    const verbs = doc.verbs().json();
    const adjectives = doc.adjectives().json();
    const textLower = text.toLowerCase();

    // Enhanced emotion detection using NLP
    const emotions = new Set<string>();
    let sentimentScore = 0;
    let emotionCounts = 0;

    // Analyze emotions in context
    sentences.forEach(sentence => {
      const sentenceDoc = nlp(sentence.text);
      Object.entries(EMOTIONS).forEach(([emotion, keywords]) => {
        keywords.forEach(keyword => {
          if (sentenceDoc.has(keyword)) {
            // Check for negations
            if (sentenceDoc.has('not ' + keyword) || sentenceDoc.has('no ' + keyword)) {
              sentimentScore -= (emotion === 'joy' || emotion === 'love') ? 1 : -1;
            } else {
              emotions.add(emotion);
              sentimentScore += (emotion === 'joy' || emotion === 'love') ? 1 : 
                               (emotion === 'fear' || emotion === 'anger' || emotion === 'sadness') ? -1 : 0;
            }
            emotionCounts++;
          }
        });
      });
    });

    // Analyze action patterns
    const actions = verbs.map(v => ({
      verb: v.text,
      isNegative: v.negative,
      tense: v.tense,
      subject: v.subject?.text || null
    }));

    // Analyze descriptive patterns
    const descriptions = adjectives.map(adj => ({
      adjective: adj.text,
      comparative: adj.comparative,
      superlative: adj.superlative
    }));

    // Enhanced theme detection using NLP context
    const themes = this.detectThemesWithContext(doc, actions, descriptions);

    // Advanced symbol analysis
    const symbols = this.analyzeSymbolsWithContext(doc, nouns, actions, descriptions);

    // Generate comprehensive interpretation
    const interpretation = this.generateInterpretation(themes, symbols, emotions, actions);
    
    // Generate personalized recommendations
    const recommendations = this.generateRecommendations(themes, emotions, sentimentScore, symbols, actions);

    return {
      sentiment: {
        score: emotionCounts > 0 ? sentimentScore / emotionCounts : 0,
        label: sentimentScore > 0.2 ? 'positive' : 
               sentimentScore < -0.2 ? 'negative' : 'neutral',
        emotions: Array.from(emotions)
      },
      themes,
      symbols,
      interpretation,
      recommendations,
      analysis: {
        actions,
        descriptions,
        patterns: this.findRecurringPatterns(doc)
      }
    };
  },

  detectThemesWithContext(doc: any, actions: any[], descriptions: any[]): string[] {
    const themes = new Set<string>();
    
    Object.entries(DREAM_THEMES).forEach(([theme, { keywords }]) => {
      // Check for theme keywords in context
      keywords.forEach(keyword => {
        const matches = doc.match(keyword);
        if (matches.found) {
          const context = matches.context();
          // If keyword appears in a positive context
          if (!context.has('not ' + keyword) && !context.has('no ' + keyword)) {
            themes.add(theme);
          }
        }
      });

      // Check action patterns associated with themes
      actions.forEach(action => {
        if (keywords.some(k => action.verb.includes(k))) {
          themes.add(theme);
        }
      });
    });

    return Array.from(themes);
  },

  analyzeSymbolsWithContext(doc: any, nouns: any[], actions: any[], descriptions: any[]): SymbolAnalysis[] {
    const symbols: SymbolAnalysis[] = [];
    
    Object.entries(SYMBOLS).forEach(([category, data]) => {
      if ('keywords' in data) {
        const symbolData = data as { keywords: string[], meaning: string };
        
        symbolData.keywords.forEach(keyword => {
          const matches = doc.match(keyword);
          if (matches.found) {
            const context = matches.context();
            const relatedActions = actions.filter(a => 
              context.has(a.verb) || context.has(a.subject)
            );
            const relatedDescriptions = descriptions.filter(d =>
              context.has(d.adjective)
            );

            symbols.push({
              symbol: category,
              meaning: symbolData.meaning,
              context: this.generateSymbolContext(
                keyword,
                relatedActions,
                relatedDescriptions,
                context.text()
              )
            });
          }
        });
      }
    });

    return symbols;
  },

  generateSymbolContext(
    symbol: string,
    actions: any[],
    descriptions: any[],
    contextText: string
  ): string {
    const actionText = actions.length
      ? `appears ${actions.map(a => a.verb).join(', ')}`
      : '';
    
    const descriptionText = descriptions.length
      ? `described as ${descriptions.map(d => d.adjective).join(', ')}`
      : '';

    return `${symbol} ${actionText} ${descriptionText} in context: "${contextText.trim()}"`;
  },

  findRecurringPatterns(doc: any): any[] {
    const patterns = [];
    const text = doc.text().toLowerCase();
    const words = text.split(/\s+/);
    
    // Find repeated words
    const wordFrequency: { [key: string]: number } = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    // Get words that appear more than once
    const repeatedWords = Object.entries(wordFrequency)
      .filter(([_, count]) => count > 1)
      .map(([word, count]) => ({
        text: word,
        count: count,
        type: 'word'
      }));

    // Find repeated phrases (2-3 words)
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(words.slice(i, i + 2).join(' '));
      if (i < words.length - 2) {
        phrases.push(words.slice(i, i + 3).join(' '));
      }
    }

    const phraseFrequency: { [key: string]: number } = {};
    phrases.forEach(phrase => {
      phraseFrequency[phrase] = (phraseFrequency[phrase] || 0) + 1;
    });

    const repeatedPhrases = Object.entries(phraseFrequency)
      .filter(([_, count]) => count > 1)
      .map(([phrase, count]) => ({
        text: phrase,
        count: count,
        type: 'phrase'
      }));

    return [...repeatedWords, ...repeatedPhrases];
  },

  generateInterpretation(themes: string[], symbols: SymbolAnalysis[], emotions: Set<string>, actions: any[]): string {
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

    // Action interpretation
    if (actions.length > 0) {
      interpretation += `The actions in your dream suggest ${actions.map(a => a.verb).join(', ')}. `;
    }

    return interpretation.trim() || 'This dream suggests a complex interplay of your thoughts and emotions.';
  },

  generateRecommendations(
    themes: string[], 
    emotions: Set<string>, 
    sentiment: number,
    symbols: SymbolAnalysis[],
    actions: any[]
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