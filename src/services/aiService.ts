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
  // Generate dream art using emoji combinations
  async generateDreamArt(dreamText: string): Promise<string> {
    const dreamLower = dreamText.toLowerCase();
    
    // Theme-based art combinations
    const artCombinations = {
      nature: ['🌳 🌸 🌿', '🌺 🍃 🌱', '🌲 🍂 🌾'],
      water: ['🌊 🌙 ⭐', '🌊 🏊 🐠', '💧 🌊 🐋'],
      sky: ['🌙 ✨ 💫', '☁️ 🌤️ 🌈', '🌟 ⭐ 🌙'],
      animals: ['🦋 🕊️ 🐇', '🦁 🐯 🐘', '🐺 🦊 🦌'],
      buildings: ['🏰 🌙 ✨', '🏛️ 🌟 🌕', '🏠 🌳 🌸'],
      emotions: ['💖 💫 ✨', '💭 💫 🌟', '💝 💫 ⭐'],
      adventure: ['🗺️ 🧭 ⭐', '🎯 🌟 💫', '🚀 ✨ 🌙'],
      mystery: ['🔮 🌙 ✨', '🎭 🌟 💫', '🎪 ⭐ 🌙']
    };

    // Default art if no themes match
    const defaultArt = ['💭 💫 ✨', '🌙 ⭐ 💫', '✨ 💫 🌟'];

    // Find matching theme
    let selectedArt = defaultArt;
    for (const [theme, art] of Object.entries(artCombinations)) {
      if (dreamLower.includes(theme)) {
        selectedArt = art;
        break;
      }
    }

    // Return random art from selected theme
    return selectedArt[Math.floor(Math.random() * selectedArt.length)];
  },

  // Simple dream pattern matching
  findPatterns(dreamText: string): string[] {
    const patterns: string[] = [];
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