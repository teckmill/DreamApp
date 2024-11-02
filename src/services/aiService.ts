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

export const aiService = {
  // Simple dream art generation using emoji art
  async generateDreamArt(dreamText: string): Promise<string> {
    const artStyles = [
      '🌙 ✨ 💫',
      '🌟 🌙 ⭐',
      '🦋 🌸 ✨',
      '🌊 🌙 ⭐',
      '🌿 🦋 💫',
      '🌸 💫 ✨'
    ];
    
    return artStyles[Math.floor(Math.random() * artStyles.length)];
  },

  // Simple dream pattern matching
  findPatterns(dreamText: string): string[] {
    const patterns = [];
    const keywords = {
      flying: ['fly', 'flying', 'float', 'floating'],
      falling: ['fall', 'falling', 'drop', 'dropping'],
      chase: ['chase', 'chasing', 'run', 'running'],
      water: ['water', 'ocean', 'sea', 'river', 'swim'],
      family: ['family', 'mother', 'father', 'sister', 'brother']
    };

    Object.entries(keywords).forEach(([pattern, words]) => {
      if (words.some(word => dreamText.toLowerCase().includes(word))) {
        patterns.push(pattern);
      }
    });

    return patterns;
  }
}; 