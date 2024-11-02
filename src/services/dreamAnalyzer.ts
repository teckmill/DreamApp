// Simple word lists for analysis
const POSITIVE_WORDS = new Set([
  'happy', 'joy', 'peaceful', 'love', 'exciting', 'beautiful', 'wonderful', 'flying',
  'success', 'achieve', 'light', 'warm', 'friend', 'pleasant', 'calm'
]);

const NEGATIVE_WORDS = new Set([
  'scary', 'fear', 'dark', 'nightmare', 'falling', 'chase', 'anxiety', 'worried',
  'lost', 'trapped', 'danger', 'threatening', 'confused', 'angry', 'sad'
]);

const DREAM_THEMES = {
  'adventure': ['journey', 'explore', 'discover', 'quest', 'travel'],
  'relationships': ['family', 'friend', 'love', 'partner', 'meeting'],
  'fear': ['chase', 'run', 'hide', 'escape', 'dark', 'monster'],
  'flying': ['fly', 'float', 'soar', 'sky', 'bird', 'wings'],
  'transformation': ['change', 'grow', 'transform', 'different', 'new'],
  'water': ['ocean', 'swim', 'river', 'flood', 'beach', 'sea'],
  'nature': ['tree', 'forest', 'garden', 'flower', 'mountain']
};

export interface DreamAnalysis {
  sentiment: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
    emotions: string[];
  };
  themes: string[];
  interpretation: string;
  recommendations: string[];
}

export const dreamAnalyzer = {
  analyzeDream(text: string): DreamAnalysis {
    const words = text.toLowerCase().split(/\W+/);
    
    // Calculate sentiment
    let sentimentScore = 0;
    const emotions = new Set<string>();
    
    words.forEach(word => {
      if (POSITIVE_WORDS.has(word)) {
        sentimentScore += 1;
        emotions.add(word);
      }
      if (NEGATIVE_WORDS.has(word)) {
        sentimentScore -= 1;
        emotions.add(word);
      }
    });

    // Normalize sentiment score to -1 to 1 range
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore / 5));

    // Detect themes
    const detectedThemes = Object.entries(DREAM_THEMES)
      .filter(([_, keywords]) => 
        keywords.some(keyword => text.toLowerCase().includes(keyword)))
      .map(([theme]) => theme);

    // Generate simple interpretation
    const interpretation = this.generateInterpretation(detectedThemes, sentimentScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(detectedThemes, sentimentScore);

    return {
      sentiment: {
        score: sentimentScore,
        label: sentimentScore > 0.2 ? 'positive' : sentimentScore < -0.2 ? 'negative' : 'neutral',
        emotions: Array.from(emotions)
      },
      themes: detectedThemes,
      interpretation,
      recommendations
    };
  },

  generateInterpretation(themes: string[], sentiment: number): string {
    const interpretations = {
      adventure: 'You may be seeking new experiences or changes in your life.',
      relationships: 'Your dream reflects your connections with others and emotional bonds.',
      fear: 'You might be processing anxiety or concerns from your waking life.',
      flying: 'This suggests a desire for freedom or transcending limitations.',
      transformation: 'You are likely going through or desiring personal growth.',
      water: 'This often represents your emotional state or unconscious mind.',
      nature: 'You may be seeking harmony or connection with your natural self.'
    };

    const themeInterpretations = themes
      .map(theme => interpretations[theme as keyof typeof interpretations])
      .filter(Boolean);

    return themeInterpretations.join(' ') || 
      'This dream suggests a complex interplay of your thoughts and emotions.';
  },

  generateRecommendations(themes: string[], sentiment: number): string[] {
    const recommendations = [
      'Consider journaling about this dream in more detail',
      'Reflect on how this dream relates to your current life situation'
    ];

    if (sentiment < -0.2) {
      recommendations.push(
        'Practice relaxation techniques before bed',
        'Consider discussing your concerns with someone you trust'
      );
    }

    if (themes.includes('transformation')) {
      recommendations.push('Embrace upcoming changes in your life');
    }

    return recommendations;
  },

  // Simple dream artwork generation using emoji art
  generateDreamArtwork(themes: string[]): string {
    const artElements = {
      adventure: '🌄',
      relationships: '💫',
      fear: '🌙',
      flying: '🦋',
      transformation: '🌈',
      water: '🌊',
      nature: '🌿'
    };

    return themes
      .map(theme => artElements[theme as keyof typeof artElements])
      .join(' ') || '✨';
  }
}; 